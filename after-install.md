# GoChat Plugin Installed

Enable it if you did not install with `--enable`:

```bash
hermes plugins enable gochat
```

Then configure the ClawTile Agent MCP endpoint:

```bash
hermes gochat mcp-configure
```

If you have a 6-digit ClawTile mini-program pairing code, use it directly:

```bash
hermes gochat mcp-configure --code 123456 --server https://voinko.com
```

## Device chat (the mini-program 对话 page)

For the ClawTile mini-program chat to show **online** and get replies, run the
Hermes gateway and keep it running — this is what loads the ClawTile chat
adapter (the recording bridge below does NOT handle chat):

```bash
hermes gateway run                              # foreground (recommended on Windows/WSL)
# or as a background service (systemd/launchd):
hermes gateway install && hermes gateway start
```

When connected, the gateway log shows
`ClawTile adapter connected; streaming https://voinko.com/api/agent/events`,
and the mini-program 对话 page flips to online. If you see `SSE 401`, re-run
`mcp-configure` with a fresh pairing code.

## Recording summaries (optional)

Separately — to auto-write a summary when a ClawTile recording finishes
transcribing (independent of chat):

```bash
hermes gochat bridge-run                 # Linux / WSL (foreground)
hermes gochat bridge-install-launchd     # macOS LaunchAgent (macOS only)
```
