#!/usr/bin/env python3
"""ClawTile device → Hermes streaming chat runner.

Invoked by the bridge when a `device.message` SSE event arrives. Runs the Hermes
agent on the user's (transcribed) text and streams the reply back to the gochat
cloud as turn progress, which the cloud relays down to the hardware.

Contract stays thin for cross-version robustness: the reply comes from
`hermes -z <prompt>` on stdout. Two deliberate choices:

  * The hardware-assistant guidance (concise Chinese, small-screen, use tools)
    lives in an AGENTS.md inside a dedicated chat CWD, which `hermes -z` loads
    automatically. So the prompt we pass is JUST the user's words — no preamble
    echoed back on every message — and the guidance applies invisibly.
  * `hermes -z` is one-shot: it builds a fresh agent per call and cannot resume
    a prior session from the CLI. So this runner is single-turn by design;
    durable multi-turn continuity is the job of the gateway/ACP adapter (later).
    Sessions are tagged `source=clawtile-device` so they're identifiable.

Env:
  CLAWTILE_AGENT_BASE  e.g. https://voinko.com/api/agent   (required)
  CLAWTILE_TOKEN       Bearer ct_a_xxx (hermes-scoped)       (required)
  HERMES_BIN           hermes binary (default: hermes)
  HERMES_MODEL         optional model override
  CLAWTILE_CHAT_DIR    chat CWD holding AGENTS.md (default: ~/.clawtile-hermes-chat)
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
CHAT_DIR = os.path.expanduser(os.environ.get("CLAWTILE_CHAT_DIR") or "~/.clawtile-hermes-chat")
SESSION_SOURCE = "clawtile-device"

# Flush buffered output to the cloud at most this often / once this many chars
# accumulate — mirrors a stream consumer's edit throttle so we neither flood the
# server with per-token POSTs nor lag the device.
FLUSH_INTERVAL_S = 0.4
FLUSH_CHARS = 24

# Hardware-assistant guidance. Lives in AGENTS.md (loaded invisibly by `hermes
# -z` from the CWD) so it never shows up in the prompt the user sees.
_AGENTS_MD = """# ClawTile 硬件助手

你是 ClawTile 硬件助手,用户通过墨水屏小设备跟你对话(语音已转成文字)。

- 回复用简洁中文,先给结论,再给必要细节。
- 适合小屏阅读:不要代码块、不要长篇大论、不要输出思考过程。
- 需要时调用你的工具完成任务(查信息、记待办、安排日程等)。
"""


def _ensure_chat_dir() -> str:
    """Create the chat CWD with an up-to-date AGENTS.md; return its path."""
    try:
        os.makedirs(CHAT_DIR, exist_ok=True)
        agents_path = os.path.join(CHAT_DIR, "AGENTS.md")
        existing = ""
        if os.path.exists(agents_path):
            with open(agents_path, "r", encoding="utf-8") as f:
                existing = f.read()
        if existing != _AGENTS_MD:
            with open(agents_path, "w", encoding="utf-8") as f:
                f.write(_AGENTS_MD)
        return CHAT_DIR
    except Exception:  # noqa: BLE001
        # Fall back to the current dir; guidance is best-effort.
        return os.getcwd()


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


def _hermes_cmd(text: str) -> list[str]:
    cmd = [HERMES_BIN, "-z", text]
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

    cwd = _ensure_chat_dir()
    child_env = {**os.environ, "HERMES_SESSION_SOURCE": SESSION_SOURCE}
    try:
        proc = subprocess.Popen(
            _hermes_cmd(user_text),
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            bufsize=1,
            text=True,
            cwd=cwd,
            env=child_env,
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
