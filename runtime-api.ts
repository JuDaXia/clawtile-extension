// Private runtime barrel for the bundled GoChat extension.
//
// OpenClaw exposes its channel-building helpers through individual plugin-sdk
// subpaths (inbound-reply-dispatch, reply-payload, setup, …). Those individual
// modules are STABLE across OpenClaw releases (verified present in both 2026.6.2
// and 2026.6.6). This file used to re-export them all from a single
// `openclaw/plugin-sdk/nextcloud-talk` barrel — a convenience aggregation that
// OpenClaw REMOVED (6.6 has no such subpath), which made the whole plugin fail
// to load on current OpenClaw. We re-export from the stable individual subpaths
// instead so the plugin survives that reorganization.
//
// Note: type-only re-exports are erased by the transpiler at runtime, so a path
// drift in a `export type` line can never crash the gateway — only the value
// re-exports below must resolve. Each value symbol below was verified to resolve
// from its subpath; if a future OpenClaw renames one, the load error names the
// exact missing module.

// --- core: account ids + channel config/section helpers ---
export {
  DEFAULT_ACCOUNT_ID,
  applyAccountNameToChannelSection,
  buildChannelConfigSchema,
  clearAccountEntryFields,
  normalizeAccountId,
} from "openclaw/plugin-sdk/core";
export type {
  AllowlistMatch,
  ChannelGroupContext,
  ChannelPlugin,
  OpenClawConfig,
  PluginRuntime,
} from "openclaw/plugin-sdk/core";

// --- config-runtime: group-policy resolution ---
export {
  GROUP_POLICY_BLOCKED_LABEL,
  resolveAllowlistProviderRuntimeGroupPolicy,
  resolveDefaultGroupPolicy,
  warnMissingProviderGroupPolicyFallbackOnce,
} from "openclaw/plugin-sdk/config-runtime";
export type { BlockStreamingCoalesceConfig } from "openclaw/plugin-sdk/config-runtime";

// --- setup: scoped account config patching + policy/secret types ---
export { patchScopedAccountConfig } from "openclaw/plugin-sdk/setup";
export type { DmPolicy, GroupPolicy, SecretInput } from "openclaw/plugin-sdk/setup";

// --- reply-payload: formatted outbound delivery ---
export { deliverFormattedTextWithAttachments } from "openclaw/plugin-sdk/reply-payload";
export type { OutboundReplyPayload } from "openclaw/plugin-sdk/reply-payload";

// --- runtime: the plugin runtime environment type ---
export type { RuntimeEnv } from "openclaw/plugin-sdk/runtime";

// --- webhook-ingress: auth rate limiting ---
export {
  WEBHOOK_RATE_LIMIT_DEFAULTS,
  createAuthRateLimiter,
} from "openclaw/plugin-sdk/webhook-ingress";

// --- channel-targets: slug/key/allowlist resolution ---
export {
  buildChannelKeyCandidates,
  normalizeChannelSlug,
  resolveChannelEntryMatchWithFallback,
  resolveNestedAllowlistDecision,
} from "openclaw/plugin-sdk/channel-targets";

// --- account list / pairing / inbound / policy ---
export { createAccountListHelpers } from "openclaw/plugin-sdk/account-helpers";
export { createChannelPairingController } from "openclaw/plugin-sdk/channel-pairing";
export { dispatchInboundReplyWithBase } from "openclaw/plugin-sdk/inbound-reply-dispatch";
export { evaluateMatchedGroupAccessForPolicy } from "openclaw/plugin-sdk/group-access";
export { logInboundDrop } from "openclaw/plugin-sdk/channel-inbound";
export {
  readStoreAllowFromForDmPolicy,
  resolveDmGroupAccessWithCommandGate,
} from "openclaw/plugin-sdk/security-runtime";
export { resolveAccountWithDefaultFallback } from "openclaw/plugin-sdk/account-core";
