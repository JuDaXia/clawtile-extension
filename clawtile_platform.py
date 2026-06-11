"""ClawTile gateway platform adapter for Hermes.

Registers a `clawtile` messaging platform so device chat from the ClawTile
hardware (relayed through the gochat cloud) runs INSIDE the Hermes gateway with
a persistent per-conversation session — real multi-turn continuity and streamed
reply, instead of the one-shot `hermes -z` bridge that opened a fresh session
per message.

Flow:
  gochat cloud  --SSE /api/agent/events-->  this adapter
     event device.message {turn_id, text, device_id, ...}
       -> build_source(chat_id=<stable conv key>) -> handle_message()
       -> Hermes gateway runs the agent in session (clawtile, chat_id)
       -> streamed reply -> adapter.send()/edit_message()
       -> POST /api/agent/turns/<turn_id>/progress  (delta ... final)
     gochat cloud relays each increment down to the device.

Same chat_id across turns => same gateway session => the agent remembers the
conversation (one session in the Hermes backend, not one-per-message).

Config (env on the gateway process, or gateway.platforms.clawtile.extra):
  CLAWTILE_AGENT_BASE   e.g. https://voinko.com/api/agent   (required)
  CLAWTILE_TOKEN        Bearer ct_a_xxx (hermes-scoped)       (required)
"""
from __future__ import annotations

import asyncio
import json
import logging
import os
from typing import Any, Dict, Optional

import httpx

from gateway.config import Platform, PlatformConfig
from gateway.platforms.base import (
    BasePlatformAdapter,
    MessageEvent,
    MessageType,
    SendResult,
)

logger = logging.getLogger(__name__)

PLATFORM_NAME = "clawtile"
# When the cloud doesn't supply a device/session id, all device chat for this
# user funnels into one rolling conversation so follow-ups continue the session.
DEFAULT_CHAT_ID = "clawtile-device"


def _env_base() -> str:
    return (os.getenv("CLAWTILE_AGENT_BASE") or "").strip().rstrip("/")


def _env_token() -> str:
    return (os.getenv("CLAWTILE_TOKEN") or os.getenv("MCP_CLAWTILE_AGENT_API_KEY") or "").strip()


class ClawtileAdapter(BasePlatformAdapter):
    # Make the stream consumer issue a terminal edit_message(finalize=True) — our
    # reliable "turn finished" signal to post the authoritative final reply.
    REQUIRES_EDIT_FINALIZE = True

    def __init__(self, config: PlatformConfig):
        super().__init__(config=config, platform=Platform(PLATFORM_NAME))
        extra = getattr(config, "extra", {}) or {}
        self.base = (
            _env_base()
            or str(extra.get("agent_base") or "").strip().rstrip("/")
            or "https://voinko.com/api/agent"
        )
        self.token = _env_token() or str(extra.get("token") or "").strip()
        self._client: Optional[httpx.AsyncClient] = None
        self._recv_task: Optional[asyncio.Task] = None
        self._turn_by_chat: Dict[str, str] = {}   # chat_id -> active turn_id
        self._sent_len: Dict[str, int] = {}        # turn_id -> chars streamed

    @property
    def name(self) -> str:
        return "ClawTile"

    @property
    def enforces_own_access_policy(self) -> bool:
        # Inbound device messages are already authenticated by the gochat cloud
        # (bearer token + device binding) before they reach us, so the gateway
        # must NOT re-apply its env-allowlist default-deny to them.
        return True

    async def get_chat_info(self, chat_id: str) -> Dict[str, Any]:
        return {"name": "ClawTile 设备", "type": "dm", "id": chat_id}

    async def connect(self) -> bool:
        if not self.base or not self.token:
            logger.error("ClawTile adapter: CLAWTILE_AGENT_BASE / CLAWTILE_TOKEN required")
            return False
        self._client = httpx.AsyncClient(timeout=httpx.Timeout(10.0, read=None))
        self._running = True
        self._recv_task = asyncio.create_task(self._receive_loop())
        logger.info("ClawTile adapter connected; streaming %s/events", self.base)
        return True

    async def disconnect(self) -> None:
        self._running = False
        if self._recv_task:
            self._recv_task.cancel()
            try:
                await self._recv_task
            except asyncio.CancelledError:
                pass
            self._recv_task = None
        if self._client:
            await self._client.aclose()
            self._client = None

    # ---- inbound: cloud SSE -> agent ----

    async def _receive_loop(self) -> None:
        backoff = 3
        while self._running:
            try:
                await self._stream_sse()
                backoff = 3  # server max-lifetime close is a clean end -> reset
            except asyncio.CancelledError:
                break
            except Exception as e:  # noqa: BLE001
                logger.warning("ClawTile SSE error: %s", e)
            if self._running:
                await asyncio.sleep(backoff)
                backoff = min(backoff * 2, 30)

    async def _stream_sse(self) -> None:
        url = f"{self.base}/events"
        headers = {"Authorization": f"Bearer {self.token}", "Accept": "text/event-stream"}
        assert self._client is not None
        async with self._client.stream("GET", url, headers=headers) as resp:
            if resp.status_code != 200:
                raise RuntimeError(f"SSE status {resp.status_code}")
            event_type: Optional[str] = None
            data_lines: list[str] = []
            async for line in resp.aiter_lines():
                if line == "":
                    if data_lines:
                        await self._handle_sse_event(event_type, "\n".join(data_lines))
                    event_type, data_lines = None, []
                    continue
                if line.startswith(":"):
                    continue  # heartbeat / comment
                if line.startswith("event:"):
                    event_type = line[len("event:"):].strip()
                elif line.startswith("data:"):
                    data_lines.append(line[len("data:"):].lstrip())

    async def _handle_sse_event(self, event_type: Optional[str], data: str) -> None:
        # The bash bridge still owns recording.transcribed (summaries); we take
        # only device chat.
        if event_type != "device.message":
            return
        try:
            payload = json.loads(data)
        except Exception:  # noqa: BLE001
            return
        turn_id = str(payload.get("turn_id") or "").strip()
        text = str(payload.get("text") or "")
        if not turn_id or not text.strip():
            return
        if not self._message_handler:
            logger.warning("ClawTile: message handler not set yet, dropping turn %s", turn_id)
            return
        chat_id = (
            str(payload.get("device_id") or "").strip()
            or str(payload.get("session_id") or "").strip()
            or DEFAULT_CHAT_ID
        )
        self._turn_by_chat[chat_id] = turn_id
        self._sent_len[turn_id] = 0
        source = self.build_source(
            chat_id=chat_id,
            chat_name="ClawTile 设备",
            chat_type="dm",
            user_id=chat_id,
            user_name="ClawTile",
        )
        event = MessageEvent(
            text=text,
            message_type=MessageType.TEXT,
            source=source,
            message_id=turn_id,
        )
        logger.info("ClawTile device turn %s -> agent (chat=%s)", turn_id, chat_id)
        # Returns quickly; the agent runs in the background and streams the reply
        # back through send()/edit_message().
        await self.handle_message(event)

    # ---- outbound: streamed reply -> cloud ----

    async def send(
        self,
        chat_id: str,
        content: str,
        reply_to: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> SendResult:
        turn_id = self._turn_by_chat.get(chat_id)
        if not turn_id:
            return SendResult(success=False, error="no active turn for chat")
        # The gateway marks the final, non-streamed agent reply with
        # metadata.notify=True (base.py ~4238). Everything else arriving via
        # send() — one-time system notices (home-channel hint, gpt-5.5
        # compaction note), streamed first-chunks — is NOT the authoritative
        # reply, so we must not let it write the turn (that's what clobbered the
        # reply and left the turn unfinalized → spinner). Streamed text still
        # flows through edit_message(); the streamed final is edit_message(
        # finalize=True). So: only a notify=True send finalizes here.
        if metadata and metadata.get("notify"):
            await self._post_progress(turn_id, {"state": "final", "text": content})
            self._sent_len.pop(turn_id, None)
            if self._turn_by_chat.get(chat_id) == turn_id:
                self._turn_by_chat.pop(chat_id, None)
        else:
            # Not the authoritative reply: a one-time system notice (home-channel
            # hint, gpt-5.5 compaction note) or a streamed first-chunk. Deliver it
            # as a notice marker on the turn — NOT into reply_text, so it neither
            # clobbers the real reply nor leaves the turn unfinalized.
            await self._post_progress(
                turn_id, {"state": "tool", "tool": {"kind": "notice", "text": content}}
            )
        return SendResult(success=True, message_id=turn_id)

    async def edit_message(
        self,
        chat_id: str,
        message_id: str,
        content: str,
        *,
        finalize: bool = False,
    ) -> SendResult:
        turn_id = self._turn_by_chat.get(chat_id) or message_id
        if finalize:
            # Authoritative: the server REPLACES reply_text with this full text,
            # so any best-effort delta drift is corrected here.
            await self._post_progress(turn_id, {"state": "final", "text": content})
            self._sent_len.pop(turn_id, None)
            # Clear the mapping so a later gateway notice (home-channel hint, cron
            # result, cross-platform message) delivered via send() to this chat
            # can't overwrite the finished reply.
            if self._turn_by_chat.get(chat_id) == turn_id:
                self._turn_by_chat.pop(chat_id, None)
        else:
            await self._post_delta(turn_id, content)
        return SendResult(success=True, message_id=turn_id)

    async def _post_delta(self, turn_id: str, accumulated: Optional[str]) -> None:
        if not accumulated:
            return
        sent = self._sent_len.get(turn_id, 0)
        if len(accumulated) <= sent:
            return  # no growth (or a non-append re-render; final will correct it)
        delta = accumulated[sent:]
        self._sent_len[turn_id] = len(accumulated)
        await self._post_progress(turn_id, {"state": "delta", "text": delta})

    async def _post_progress(self, turn_id: str, body: dict) -> None:
        url = f"{self.base}/turns/{turn_id}/progress"
        headers = {"Authorization": f"Bearer {self.token}"}
        try:
            assert self._client is not None
            await self._client.post(url, json=body, headers=headers, timeout=20.0)
        except Exception as e:  # noqa: BLE001
            logger.warning("ClawTile progress POST %s failed: %s", body.get("state"), e)
