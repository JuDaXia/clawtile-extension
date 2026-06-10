#!/usr/bin/env python3
"""ClawTile device → Hermes streaming chat runner.

Invoked by the bridge when a `device.message` SSE event arrives. Runs the Hermes
agent on the user's (transcribed) text and streams the reply back to the gochat
cloud as turn progress, which the cloud relays down to the hardware.

Contract is deliberately thin for cross-version robustness: we only depend on
`hermes -z <prompt>` emitting the reply on stdout (the same invocation the
summary bridge already relies on). No internal Hermes APIs, so it survives
Hermes version drift. Tool-level progress (a richer stream) can later come from
the gateway platform adapter / ACP; this runner forwards stdout as text deltas.

Env:
  CLAWTILE_AGENT_BASE  e.g. https://voinko.com/api/agent   (required)
  CLAWTILE_TOKEN       Bearer ct_a_xxx (hermes-scoped)       (required)
  HERMES_BIN           hermes binary (default: hermes)
  HERMES_MODEL         optional model override
  CLAWTILE_CHAT_MAX_REPLY_CHARS  cap streamed reply (default 6000)

Usage: clawtile_hermes_chat.py <turn_id> <user_text>
"""
from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
import time
import urllib.error
import urllib.request

AGENT_BASE = (os.environ.get("CLAWTILE_AGENT_BASE") or "").strip().rstrip("/")
TOKEN = (os.environ.get("CLAWTILE_TOKEN") or "").strip()
HERMES_BIN = (os.environ.get("HERMES_BIN") or "hermes").strip()
HERMES_MODEL = (os.environ.get("HERMES_MODEL") or "").strip()
MAX_REPLY = int(os.environ.get("CLAWTILE_CHAT_MAX_REPLY_CHARS") or "6000")

# Flush buffered output to the cloud at most this often / once this many chars
# accumulate — mirrors a stream consumer's edit throttle so we neither flood the
# server with per-token POSTs nor lag the device.
FLUSH_INTERVAL_S = 0.4
FLUSH_CHARS = 24


def _post_progress(turn_id: str, body: dict) -> None:
    url = f"{AGENT_BASE}/turns/{turn_id}/progress"
    data = json.dumps(body).encode("utf-8")
    req = urllib.request.Request(url, data=data, method="POST")
    req.add_header("Authorization", f"Bearer {TOKEN}")
    req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            resp.read()
    except urllib.error.HTTPError as e:
        # Best-effort: a dropped delta just means the device misses one chunk;
        # the final state still reconciles the full reply.
        sys.stderr.write(f"[chat] progress POST {body.get('state')} -> HTTP {e.code}\n")
    except Exception as e:  # noqa: BLE001
        sys.stderr.write(f"[chat] progress POST {body.get('state')} failed: {e}\n")


def _build_prompt(text: str) -> str:
    return (
        "你是用户的硬件语音助手。用户通过 ClawTile 设备(墨水屏)对你说话,内容已转成文字。\n"
        "请理解并执行用户的请求——需要时调用你的工具完成任务(查信息、记待办、安排日程等)。\n"
        "用简洁中文回复,适合小屏显示;先给结论,再给必要细节。不要输出思考过程或代码块。\n\n"
        f"用户说:{text}"
    )


def _hermes_cmd(prompt: str) -> list[str]:
    cmd = [HERMES_BIN, "-z", prompt]
    if HERMES_MODEL:
        cmd += ["--model", HERMES_MODEL]
    return cmd


def main() -> int:
    if len(sys.argv) < 3:
        sys.stderr.write("usage: clawtile_hermes_chat.py <turn_id> <user_text>\n")
        return 2
    turn_id = sys.argv[1].strip()
    user_text = sys.argv[2]
    if not AGENT_BASE or not TOKEN:
        sys.stderr.write("[chat] CLAWTILE_AGENT_BASE / CLAWTILE_TOKEN required\n")
        return 2
    if not turn_id:
        sys.stderr.write("[chat] missing turn_id\n")
        return 2

    if shutil.which(HERMES_BIN) is None:
        _post_progress(turn_id, {"state": "error", "error": f"{HERMES_BIN} not found"})
        return 1

    prompt = _build_prompt(user_text)
    try:
        proc = subprocess.Popen(
            _hermes_cmd(prompt),
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            bufsize=1,
            text=True,
        )
    except Exception as e:  # noqa: BLE001
        _post_progress(turn_id, {"state": "error", "error": f"spawn hermes failed: {e}"})
        return 1

    sent = 0
    buf: list[str] = []
    buf_len = 0
    last_flush = time.monotonic()

    def flush() -> None:
        nonlocal buf, buf_len, last_flush, sent
        if not buf:
            return
        chunk = "".join(buf)
        buf = []
        buf_len = 0
        last_flush = time.monotonic()
        if sent >= MAX_REPLY:
            return
        if sent + len(chunk) > MAX_REPLY:
            chunk = chunk[: MAX_REPLY - sent]
        sent += len(chunk)
        if chunk:
            _post_progress(turn_id, {"state": "delta", "text": chunk})

    assert proc.stdout is not None
    while True:
        ch = proc.stdout.read(64)
        if ch == "":
            break
        buf.append(ch)
        buf_len += len(ch)
        now = time.monotonic()
        if buf_len >= FLUSH_CHARS or (now - last_flush) >= FLUSH_INTERVAL_S:
            flush()
    flush()

    rc = proc.wait()
    if rc != 0 and sent == 0:
        _post_progress(turn_id, {"state": "error", "error": f"hermes exited rc={rc}"})
        return 1
    # Mark final; server keeps the accumulated delta text (no text needed).
    _post_progress(turn_id, {"state": "final"})
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
