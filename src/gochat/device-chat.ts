// Device chat (mini-program 对话) over the gochat agent SSE, on the OpenClaw
// side. Mirrors the Hermes clawtile_platform.py adapter:
//
//   cloud --SSE device.message {turn_id, text, session_id}--> this monitor
//     -> run an OpenClaw agent turn (handleGoChatInbound, conv = agent-device:<session>)
//     -> POST /api/agent/turns/<turn_id>/progress {state:final, text}  (cloud relays down)
//
// The conversation id is keyed by session_id (stable) so OpenClaw keeps one
// conversation per mini-program session (multi-turn continuity); a separate
// session->turn map routes each reply to the message that triggered it.

import { postTurnProgress } from "./agent-client.js";
import type { ResolvedGoChatAccount } from "../accounts.js";

const DEVICE_CONV_PREFIX = "agent-device:";

// session_id -> the turn_id currently awaiting a reply (one active turn/session).
const turnBySession = new Map<string, string>();

export function deviceConversationId(sessionId: string): string {
  return `${DEVICE_CONV_PREFIX}${sessionId || "device"}`;
}

export function isDeviceConversation(conversationId: string): boolean {
  return conversationId.startsWith(DEVICE_CONV_PREFIX);
}

function deviceSessionOf(conversationId: string): string {
  return conversationId.slice(DEVICE_CONV_PREFIX.length);
}

export function recordDeviceTurn(sessionId: string, turnId: string): void {
  turnBySession.set(sessionId || "device", turnId);
}

// Drop a session's active turn so a late reply is discarded (used on device.stop,
// and after a final/error). When turnId is given, only clears if it still matches.
export function clearDeviceTurn(sessionId: string, turnId?: string): void {
  const key = sessionId || "device";
  if (!turnId || turnBySession.get(key) === turnId) {
    turnBySession.delete(key);
  }
}

// Reply path (called from send.ts when the agent's reply for a device
// conversation is ready): post it as the turn's authoritative final text.
export async function sendDeviceTurnReply(
  conversationId: string,
  text: string,
  account: ResolvedGoChatAccount,
): Promise<{ messageId: string; conversationId: string }> {
  const sessionId = deviceSessionOf(conversationId);
  const turnId = turnBySession.get(sessionId || "device");
  if (turnId) {
    await postTurnProgress(account, turnId, { state: "final", text });
    clearDeviceTurn(sessionId, turnId); // one final per turn
  }
  // If turnId is gone the user stopped (or it already finalized) — drop quietly.
  return { messageId: turnId || sessionId, conversationId };
}

// Error path (called when the agent run throws): fail the turn so the
// mini-program stops showing 处理中 instead of hanging.
export async function failDeviceTurn(
  account: ResolvedGoChatAccount,
  sessionId: string,
  turnId: string,
  message: string,
): Promise<void> {
  await postTurnProgress(account, turnId, {
    state: "error",
    error: message || "执行失败",
  }).catch(() => undefined);
  clearDeviceTurn(sessionId, turnId);
}
