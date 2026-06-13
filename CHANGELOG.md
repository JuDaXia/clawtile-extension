# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2026.6.13-plugin.53] - 2026-06-13

### Fixed
- **OpenClaw 2026.6.x: `openclaw gochat bind-agent` (and the other `gochat`
  subcommands) are exposed again.** 6.x builds its CLI command tree from the
  channel entry's `registerCliMetadata` hook at the CLI parse phase; the
  subcommands had only been wired in the runtime-only `registerFull` hook, so the
  parser never saw them (`openclaw gochat bind-agent --code` → "does not recognize
  --code"). The full command tree is now built in `registerCliMetadata` (shared
  `src/cli.ts` + parse-time descriptors in `src/cli-descriptors.ts`); `registerFull`
  no longer builds the CLI, to avoid double-registration in full mode.
- **Agent mode: device chat and recording-summary turns are no longer dropped by
  the DM allowlist.** `dmPolicy=open` gates DMs to allowlisted senders, which
  silently dropped the synthetic `clawtile-device` / `clawtile-agent` senders
  ("dmPolicy=open (not allowlisted)") so the mini-program 对话 never got a reply.
  Agent-mode inbound arrives only over the authenticated cloud SSE, so the
  per-sender DM gate (meant for relay/direct mode) is now skipped.

## [2026.6.10-plugin.52] - 2026-06-11

### Added
- Stop support: the adapter handles a `device.stop` SSE event by injecting `/stop` for the same chat_id, so the Hermes gateway cancels the in-flight agent run for that session (the user tapped 停止 in the mini-program). The turn mapping is cleared so the cancelled run's late send/edit are ignored.

## [2026.6.10-plugin.51] - 2026-06-11

### Fixed
- Gateway platform adapter reworked against the reference adapters (Feishu/Telegram/Slack) for robust reply delivery + token self-heal:
  - Tool-using / long replies always stream via GatewayStreamConsumer: an initial `send()` (no notify) + `edit_message` deltas + a terminal `edit_message(finalize=True)`. The old adapter mislabeled that initial `send()` as a system notice, so the reply never reached `reply_text` and the device spun forever. Now EVERY reply path ends with a `final` carrying the full text (which the cloud replaces into `reply_text`); the initial send + mid deltas stream as best-effort `delta`s. Covers non-streamed (`send(notify=True)`), streamed, and tool-call replies.
  - A `send()` with no active turn (post-turn gateway notice) is dropped rather than fabricating a reply on a finished turn.
  - Token self-heal: the bearer token is re-read from the LIVE `~/.hermes/.env` on every (re)connect (via `load_env()`, since `os.environ`/`get_env_value` keep the value frozen at gateway start). So after a user re-pairs (new token), the SSE recovers automatically within the reconnect backoff — no more permanent 401 lockup, no gateway restart needed. SSE/POST 401s are logged and trigger a fresh-token reconnect.

## [2026.6.10-plugin.50] - 2026-06-11

### Fixed
- Gateway platform adapter is now correct end-to-end (verified live):
  - `enforces_own_access_policy = True` — device messages are already authed by the gochat cloud (token + binding), so the gateway must not re-deny them under its env-allowlist default-deny.
  - Only the final agent reply (gateway marks it `metadata.notify=True`) writes `reply_text` and finalizes the turn — fixes the mini-program "send button spins forever" (the turn now reliably reaches `final`).
  - One-time system notices (home-channel hint, gpt-5.5 compaction note) are delivered as `tool` notice markers on the turn instead of being written into `reply_text` — they no longer clobber the real reply, and they are not dropped (the mini-program shows them as a system line).
  - `get_chat_info` implemented (required abstract method); turn→chat mapping cleared on finalize so a later notice can't overwrite a finished reply.
- Set `CLAWTILE_HOME_CHANNEL` (per device) suppresses the one-time home-channel onboarding prompt for the ClawTile platform.

## [2026.6.10-plugin.49] - 2026-06-10

### Added
- The Hermes gateway platform adapter is now part of THIS plugin — one install does everything. `register(ctx)` registers the CLI command, the skill, AND a `clawtile` gateway messaging platform (`clawtile_platform.py`). When `hermes gateway` runs, device chat flows through a persistent per-conversation Hermes session (real multi-turn continuity + streamed reply via `send`/`edit_message` → `/turns/:id/progress`), instead of the one-shot `hermes -z` bridge that opened a fresh session per message. The platform reuses the token `mcp-configure` already saved (`MCP_CLAWTILE_AGENT_API_KEY` in `~/.hermes/.env`) via `env_enablement_fn`, so binding once is enough — no extra config. Gateway/httpx imports stay lazy so the CLI-context plugin load never pulls gateway modules.

## [2026.6.10-plugin.48] - 2026-06-10

### Changed
- Device→Hermes chat no longer prepends a verbose preamble to every message. The hardware-assistant guidance (concise Chinese, small-screen, use tools) moved into an `AGENTS.md` inside a dedicated chat CWD, which `hermes -z` loads automatically, so the prompt Hermes receives is just the user's words.

### Known limitation
- `hermes -z` (oneshot) builds a fresh agent per call and cannot resume a session from the CLI, so device chat is single-turn for now (each message is its own Hermes session, tagged `source=clawtile-device`). Durable multi-turn continuity will come from the gateway/ACP platform adapter.

## [2026.6.10-plugin.47] - 2026-06-10

### Added
- Hermes bridge now handles `device.message` SSE events: hardware-originated chat turns (transcribed voice or text from the mini-program) run the Hermes agent and stream the reply back to the gochat cloud as turn progress, which is relayed to the device. New runner `skills/clawtile-hermes-online/scripts/clawtile_hermes_chat.py` streams `hermes -z` stdout into `POST /api/agent/turns/:id/progress` (delta → final). Version-robust: depends only on the `hermes -z <prompt>` contract, no internal Hermes APIs.
- Pairing exchange now sends `host: "hermes"` so a user can bind both OpenClaw and Hermes at once (dual binding), switched per device server-side.

## [2026.6.9-plugin.46] - 2026-06-09

### Fixed
- bridge SSE reconnect backoff no longer creeps to the 30s cap on every reconnect. The reset (`backoff=3` on `connection.ack`) lived inside the `curl | while read` subshell and never reached the parent loop (the Hermes variant had no reset at all), so once the server started cycling the SSE periodically (its ~4min max-lifetime close added server-side to clear half-open "ghost" connections), each reconnect grew the delay until a live agent showed a ~30s "offline" gap every few minutes. Backoff is now reset by connection duration in the parent loop: a session that lasted ≥10s reconnects in 3s; only fast failures (connect refused / auth error / instant drop) grow the backoff toward the cap.

## [2026.5.26-plugin.45] - 2026-05-26

### Fixed
- `bridge-run` now reconciles `summary_state=none` recordings on startup and after every SSE reconnect by calling `GET /api/agent/recordings?summary_state=none&status=completed` and processing each result. Previously SSE was the only source of "process this recording" signals, so any `recording.transcribed` event that fired while the bridge was offline (or during a reconnect) was lost forever and the recording stayed without a summary.
- Default server URL switched from `clawtile.moyi.vip` to `voinko.com` across the plugin code (`__init__.py` DEFAULT_SERVER, `src/types.ts`, `skills/clawtile-hermes-online/scripts/clawtile_hermes_bridge.sh`, install scripts, README/after-install docs). The old domain is no longer reachable.

## [2026.5.14-plugin.44] - 2026-05-14

### Added
- Added Hermes plugin pairing-code support via `hermes gochat mcp-configure --code <code>`, allowing ClawTile mini-program prompts to bind Hermes without exposing tokens in shell history.

### Changed
- Updated Hermes install guidance to prefer native plugin pairing from the mini-program code.

## [2026.5.14-plugin.43] - 2026-05-14

### Changed
- Moved AI assistant onboarding prompts into the public README so users can ask an AI to install the OpenClaw channel plugin or Hermes-native plugin directly from the repository.
- Updated the AI-readable install context to choose Hermes plugin mode when the user asks for Hermes Agent integration.

## [2026.5.14-plugin.42] - 2026-05-14

### Added
- Added Hermes-native plugin support with root `plugin.yaml` and `__init__.py`, so users can install with `hermes plugins install JuDaXia/clawtile-extension --enable`.
- Added the `hermes gochat` CLI command group with `status`, `mcp-configure`, `bridge-run`, `bridge-install-launchd`, and `install-skills` commands.
- Registered the Hermes plugin-owned skill `gochat:clawtile-hermes-online` for explicit plugin skill loading.

## [2026.5.14-plugin.41] - 2026-05-14

### Added
- Added the `clawtile-hermes-online` pure skills integration for Hermes Agent, with MCP setup guidance and an SSE bridge that runs `hermes -z` for completed ClawTile recordings.
- Added a macOS LaunchAgent installer for the Hermes online bridge so ClawTile can stay connected without the OpenClaw TypeScript channel runtime.

### Changed
- Installers now copy bundled skills to `~/.hermes/skills` when Hermes Agent is installed or `HERMES_HOME` is configured, while continuing to install OpenClaw skills to `~/.openclaw/skills`.

## [2026.5.14-plugin.40] - 2026-05-14

### Changed
- Updated the plugin compatibility baseline to OpenClaw `2026.5.7`, matching the latest stable upstream release from `openclaw/openclaw`.
- Updated public install metadata, peer dependency requirements, and README requirements for the current OpenClaw external channel install flow.
- Updated OpenClaw documentation links from the legacy `m0yi/openclaw` repository to `openclaw/openclaw`.

## [2026.4.9-plugin.39] - 2026-05-13

### Added
- Added ClawTile account-level agent mode with `openclaw gochat bind-agent --code <code>` for mini-program pairing codes.
- Agent mode connects to `/api/agent/events`, reconciles pending recordings, asks OpenClaw to summarize completed transcripts, and writes summaries back to ClawTile.

### Changed
- Default GoChat/ClawTile server URLs now point to `https://clawtile.moyi.vip`.

## [2026.4.9-plugin.38] - 2026-04-10

### Added
- Plugin logs now include explicit OpenClaw command start/success/failure lines for runtime snapshot and model-switch commands, including duration and formatted error details, so remote relay diagnostics show what GoChat actually asked OpenClaw to execute

## [2026.4.9-plugin.37] - 2026-04-10

### Fixed
- Plugin runtime polls now coalesce in-flight subagent-permission and OpenClaw snapshot refreshes instead of spawning overlapping `openclaw` child processes every 10-20 seconds, reducing the risk of relay mode overwhelming slower Linux VMs or destabilizing the local Gateway

## [2026.4.9-plugin.36] - 2026-04-10

### Fixed
- Increased plugin-side OpenClaw command timeouts from roughly 12-15 seconds to 60 seconds, reducing Linux relay false failures when `openclaw models list --json`, `models set`, or related runtime snapshot commands respond slowly

## [2026.4.9-plugin.35] - 2026-04-10

### Fixed
- Plugin-side runtime refresh now collects Sessions and Models independently, so `pairing required` failures from `gateway call sessions.list` no longer suppress the remote model list payload used by `/api/chat/models`
- Relay logs now include OpenClaw runtime refresh counts and per-snapshot error details, making it visible when Sessions fail due to pairing while Models still refresh successfully

## [2026.4.9-plugin.34] - 2026-04-10

### Fixed
- Plugin-side model snapshots now use `openclaw models list --json` instead of `openclaw models list --all --json`, so GoChat only shows the remote device's actually configured/selectable models rather than every globally visible provider model

## [2026.4.9-plugin.33] - 2026-04-09

### Changed
- Model list and model switch control now run on the connected GoChat plugin machine, so `/models`, `/model`, and admin-side model changes no longer depend on the Go server host's local OpenClaw installation
- Plugin runtime refresh now also carries `openclawModelsJson`, allowing the Go backend to render and mutate model state entirely from plugin-reported metadata

## [2026.4.9-plugin.32] - 2026-04-09

### Fixed
- `/app` runtime session data now comes from the connected GoChat plugin machine instead of the Go server host, so OpenClaw Sessions in the demo UI follow the remote plugin's `sessions.list` result rather than the backend machine's local state
- Relay runtime refresh requests now trigger an immediate plugin-side OpenClaw session snapshot refresh before the next status push, helping `/app` converge on the connected device's latest Sessions view faster

## [2026.4.9-plugin.31] - 2026-04-09

### Changed
- Relay runtime now publishes a structured `runtimeWorkUnitsJson` snapshot derived from live `activeJobs`, so the demo UI can render each current work unit with its own status badge instead of only showing a single aggregate number

## [2026.4.9-plugin.30] - 2026-04-09

### Changed
- Relay status now reports `activeJobs` as the live work-unit count instead of reusing the configured account count, so GoChat surfaces a truthful “运行任务数” rather than a misleading “1 个代理”

## [2026.4.9-plugin.29] - 2026-04-09

### Fixed
- `openclaw gochat approve-local-repair` now treats `operator.talk.secrets` as part of the standard safe local CLI operator scope-upgrade set, so current OpenClaw repair requests that include talk secret access can still be matched and approved

## [2026.4.9-plugin.28] - 2026-04-09

### Changed
- GoChat permission status messages now include an explicit `Device approval` line so users can see whether the local repair request is approved, pending, limited, or unknown without inferring it from the rest of the text
- Relay runtime status metadata now includes the current subagent device approval state, allowing the demo `/app` header to show the same approval state live alongside model and command details

## [2026.4.9-plugin.27] - 2026-04-09

### Added
- Added `openclaw gochat approve-local-repair`, a dedicated manual recovery command that safely matches and approves the current eligible local CLI repair request instead of requiring users to run raw `openclaw devices approve ...` commands

### Changed
- GoChat subagent permission status messages now recommend `openclaw gochat approve-local-repair` first, while still showing a direct `openclaw devices approve ...` fallback command

## [2026.4.9-plugin.26] - 2026-04-09

### Fixed
- Shell installer now marks `gochat` as trusted even when managed `openclaw plugins install` falls back to direct file extraction, so `plugins.allow is empty` and `untracked local code` warnings do not appear after fallback installs
- PowerShell installer now writes the same `plugins.allow` trust entry after Windows installs, matching the shell installer trust behavior

## [2026.4.8-plugin.25] - 2026-04-08

### Added
- GoChat now proactively pushes the current subagent permission state into each conversation on first contact and whenever the local gateway pairing state changes, so users can see `ready` / `action required` status without asking first
- Pending local gateway repair requests now surface as an actionable status message with `openclaw devices approve ...`, while recovered sessions push a `ready` status message after admin scope returns

## [2026.4.8-plugin.24] - 2026-04-08

### Added
- When an inbound GoChat session fails with gateway `pairing required`, the plugin now sends an actionable chat reply that includes a concrete `openclaw devices approve ...` command and a fallback `openclaw pairing approve --channel gochat <PAIRING_CODE> --notify` hint instead of letting the model narrate a vague recovery attempt

## [2026.4.8-plugin.23] - 2026-04-08

### Changed
- Default installs no longer run the experimental automatic local gateway authorization/bootstrap path during install or plugin startup
- Existing accounts now require an explicit one-time `openclaw gochat authorize-mode-switch --mode <local|relay>` grant before switching between local and relay modes

### Added
- Added `openclaw gochat authorize-mode-switch` to create a short-lived one-time mode-switch authorization consumed by the next successful switch

## [2026.4.8-plugin.22] - 2026-04-08

### Fixed
- Shell installer now uses `npm install --omit=dev` everywhere instead of the deprecated `--production` flag, so modern npm no longer prints the `production Use --omit=dev instead` warning during install
- README manual-install examples now use `npm install --omit=dev` to match the shipped installers

## [2026.4.8-plugin.21] - 2026-04-08

### Fixed
- Installers now probe `openclaw gochat --help` before calling `ensure-gateway-access`, so older or partially-loaded CLI states no longer print `too many arguments for 'gochat'` during installation
- Shell and PowerShell installers now suppress bootstrap command parser noise and fall back cleanly to the plugin runtime retry path when the local gateway access command is unavailable

## [2026.4.8-plugin.20] - 2026-04-08

### Fixed
- Relay runtime now keeps a short-lived local gateway access watch active while GoChat is executing work, so safe local CLI repair requests that appear mid-session can still be auto-approved instead of only being checked during install or plugin startup
- Relay runtime now retries the same safe gateway access bootstrap after relay-side errors, reducing `pairing required` interruptions on older local OpenClaw builds that still surface loopback scope-upgrade repair windows during subagent or operator actions

## [2026.4.8-plugin.19] - 2026-04-08

### Added
- Added `openclaw gochat ensure-gateway-access` to normalize loopback gateway URLs and auto-approve safe local CLI repair requests that only ask for the standard full operator scopes

### Changed
- Installers now persist GoChat gateway access bootstrap defaults and run the local gateway access bootstrap step right after configuration
- Plugin startup now retries the same safe local gateway access bootstrap in the background so existing installs can recover once the gateway is live

## [2026.4.8-plugin.18] - 2026-04-08

### Fixed
- Shell installer now creates the base OpenClaw config before relay registration so fresh installs can save pairing credentials immediately instead of waiting for first gateway startup
- Shell installer now retries relay registration and preserves the configured device name when requesting new relay credentials

## [2026.4.8-plugin.17] - 2026-04-08

### Added
- Added plugin-side runtime refresh handling so the server can request an immediate parameter/status resync after model or runtime parameter changes
- Added runtime schema version metadata for the standardized runtime parameter sync protocol

### Changed
- Relay runtime status snapshots now reload the latest OpenClaw config before reporting current model and account metadata

## [2026.4.8-plugin.16] - 2026-04-08

### Added
- Relay status metadata now includes the current model plus the active OpenClaw command and arguments
- GoChat app header now shows the current model and runtime command details from the connected plugin

## [2026.4.7-plugin.15] - 2026-04-07

### Fixed
- Script installs now prefer `openclaw plugins install` for managed plugin provenance when the OpenClaw CLI is available
- Script installs now auto-add `gochat` to `plugins.allow` so trusted installs do not require manual trust configuration

## [2026.4.7-plugin.14] - 2026-04-07

### Fixed
- Fixed relay WebSocket message handling so long-running AI execution and block streaming no longer block heartbeat/status traffic
- Added active-job relay status keepalive pulses during long-running executions
- Fixed S3 presigned upload signing for browser uploads, including UTF-8 filenames and required `x-amz-content-sha256` propagation
- Added stricter S3 upload test flow: upload, public access verification, then cleanup

## [2026.4.7-plugin.13] - 2026-04-07

### Changed
- Shell installer now refuses npm fallback so script installs always come from current GitHub source
- Enabled GoChat block streaming by default across plugin runtime and installers
- Added relay reply event passthrough and chat UI incremental rendering support
- Version bump to plugin.13

## [2026.4.6-plugin.12] - 2026-04-07

### Changed
- Enabled GoChat block streaming by default across plugin runtime and installers
- Added relay reply event passthrough and chat UI incremental rendering support
- Version bump to plugin.12

## [2026.4.6-plugin.9] - 2026-04-06

### Changed
- Version bump to plugin.9

## [2026.3.28] - 2026-03-28

### Added
- Simplified configuration model: `local` and `relay` modes only
- Zero-config local mode with auto-generated secrets
- Full configuration logging on startup
- New `--local` / `--relay` installer flags
- `--from-tarball` option for offline installation

### Changed
- `direct` mode renamed to `local` mode
- `relay-ws` mode renamed to `relay` mode
- Removed `baseUrl`, `callbackUrl`, `callbackSecret` configuration options
- Removed HTTP webhook server (WebSocket relay only)
- `dmPolicy` default changed from `pairing` to `open`

### Fixed
- Improved auto-reconnection for relay mode
- Better error messages for misconfiguration

## [2026.3.x] - Previous Versions

- See git history for previous changelog entries
