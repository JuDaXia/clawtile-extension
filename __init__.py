"""Hermes Agent plugin entry for GoChat / ClawTile."""

from __future__ import annotations

import getpass
import json
import os
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any


PLUGIN_VERSION = "2026.6.10-plugin.51"
DEFAULT_SERVER = "https://voinko.com"
DEFAULT_MCP_NAME = "clawtile-agent"
DEFAULT_MCP_ENV = "MCP_CLAWTILE_AGENT_API_KEY"


def _plugin_dir() -> Path:
    return Path(__file__).resolve().parent


def _agent_base(server: str) -> str:
    value = (server or DEFAULT_SERVER).strip().rstrip("/")
    if value.endswith("/api/agent"):
        return value
    return f"{value}/api/agent"


def _bridge_script() -> Path:
    return _plugin_dir() / "skills" / "clawtile-hermes-online" / "scripts" / "clawtile_hermes_bridge.sh"


def _launchd_script() -> Path:
    return _plugin_dir() / "skills" / "clawtile-hermes-online" / "scripts" / "install_launchd.sh"


def _hermes_home() -> Path:
    try:
        from hermes_constants import get_hermes_home

        return get_hermes_home()
    except Exception:
        return Path(os.environ.get("HERMES_HOME") or Path.home() / ".hermes")


def _copytree_merge(src: Path, dst: Path) -> int:
    count = 0
    if not src.exists():
        return count
    for child in src.iterdir():
        target = dst / child.name
        if child.is_dir():
            target.mkdir(parents=True, exist_ok=True)
            count += _copytree_merge(child, target)
        else:
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(child.read_bytes())
            count += 1
    return count


def _exchange_pair_code(server: str, code: str, display_name: str = "Hermes Agent") -> str:
    code = (code or "").strip()
    if not code:
        raise SystemExit("Missing ClawTile pairing code.")

    payload = json.dumps(
        {
            "code": code,
            "display_name": display_name,
            "agent_hint": "hermes",
            # Bind this credential to the hermes host so a user can also bind
            # OpenClaw at the same time (dual binding, switched per device).
            "host": "hermes",
            "client_info": {
                "platform": "hermes-gochat-plugin",
                "version": PLUGIN_VERSION,
            },
        }
    ).encode("utf-8")
    req = urllib.request.Request(
        f"{_agent_base(server)}/pair/exchange",
        data=payload,
        headers={"Content-Type": "application/json", "User-Agent": f"gochat-hermes-plugin/{PLUGIN_VERSION}"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        raise SystemExit(f"ClawTile pairing failed: HTTP {exc.code} {body}") from exc
    except urllib.error.URLError as exc:
        raise SystemExit(f"ClawTile pairing failed: {exc.reason}") from exc

    token = str(data.get("token") or "").strip()
    if not token:
        raise SystemExit("ClawTile pairing succeeded but no token was returned.")
    return token


def _save_mcp_config(args: Any) -> None:
    from hermes_cli.config import get_env_value, load_config, save_config, save_env_value

    name = args.name or DEFAULT_MCP_NAME
    env_key = args.env_key or DEFAULT_MCP_ENV
    server = args.server or DEFAULT_SERVER
    code = getattr(args, "code", "") or ""
    token = ""
    if code.strip():
        token = _exchange_pair_code(server, code, getattr(args, "display_name", "") or "Hermes Agent")
    else:
        token = (args.token or os.environ.get("CLAWTILE_TOKEN") or get_env_value(env_key) or "").strip()

    if not token and not args.no_prompt:
        token = getpass.getpass("ClawTile agent token (ct_a_...): ").strip()

    if not token:
        raise SystemExit(
            "Missing ClawTile agent token. Pass --token, set CLAWTILE_TOKEN, "
            f"or save {env_key} in ~/.hermes/.env."
        )

    save_env_value(env_key, token)
    config = load_config()
    config.setdefault("mcp_servers", {})[name] = {
        "url": f"{_agent_base(server)}/mcp",
        "headers": {
            "Authorization": f"Bearer ${{{env_key}}}",
        },
        "enabled": True,
    }
    save_config(config)

    print(f"GoChat MCP server configured: {name}")
    print(f"Endpoint: {_agent_base(server)}/mcp")
    print(f"Token env: {env_key}")
    print("Start a new Hermes session to use the ClawTile MCP tools.")


def _bridge_env(args: Any) -> dict[str, str]:
    env = dict(os.environ)
    server = args.server or DEFAULT_SERVER
    token = ""
    code = getattr(args, "code", "") or ""
    if code.strip():
        token = _exchange_pair_code(server, code, getattr(args, "display_name", "") or "Hermes Agent")
    if not token:
        token = (args.token or env.get("CLAWTILE_TOKEN") or "").strip()
    if not token:
        try:
            from hermes_cli.config import get_env_value

            token = (get_env_value(DEFAULT_MCP_ENV) or "").strip()
        except Exception:
            token = ""
    if not token and not getattr(args, "no_prompt", False):
        token = getpass.getpass("ClawTile agent token (ct_a_...): ").strip()
    if not token:
        raise SystemExit("Missing ClawTile agent token. Pass --token or set CLAWTILE_TOKEN.")

    env["CLAWTILE_BASE"] = server
    env["CLAWTILE_TOKEN"] = token
    if getattr(args, "hermes_bin", None):
        env["HERMES_BIN"] = args.hermes_bin
    if getattr(args, "model", None):
        env["HERMES_MODEL"] = args.model
    if getattr(args, "log", None):
        env["BRIDGE_LOG"] = args.log
    if getattr(args, "max_transcript_chars", None):
        env["MAX_TRANSCRIPT_CHARS"] = str(args.max_transcript_chars)
    return env


def _cmd_status(args: Any) -> None:
    home = _hermes_home()
    print(f"GoChat Hermes plugin: {PLUGIN_VERSION}")
    print(f"Plugin path: {_plugin_dir()}")
    print(f"Hermes home: {home}")
    print(f"Bridge script: {_bridge_script()}")
    print(f"LaunchAgent script: {_launchd_script()}")
    print(f"Default server: {DEFAULT_SERVER}")

    try:
        from hermes_cli.config import get_env_value, load_config

        config = load_config()
        mcp = config.get("mcp_servers", {}).get(args.name or DEFAULT_MCP_NAME)
        print(f"MCP '{args.name or DEFAULT_MCP_NAME}': {'configured' if mcp else 'not configured'}")
        print(f"{args.env_key or DEFAULT_MCP_ENV}: {'set' if get_env_value(args.env_key or DEFAULT_MCP_ENV) else 'not set'}")
    except Exception as exc:
        print(f"MCP status unavailable: {exc}")


def _cmd_install_skills(args: Any) -> None:
    src = _plugin_dir() / "skills"
    dst = Path(args.skills_dir).expanduser() if args.skills_dir else _hermes_home() / "skills"
    copied = _copytree_merge(src, dst)
    print(f"Installed GoChat skills to {dst} ({copied} files).")


def _cmd_mcp_configure(args: Any) -> None:
    _save_mcp_config(args)


def _cmd_bridge_run(args: Any) -> None:
    script = _bridge_script()
    if not script.exists():
        raise SystemExit(f"Bridge script not found: {script}")

    cmd = ["/bin/bash", str(script)]
    if args.once:
        cmd.extend(["once", args.once])
    print(f"Starting GoChat Hermes bridge: {script}")
    raise SystemExit(subprocess.call(cmd, env=_bridge_env(args)))


def _cmd_bridge_install_launchd(args: Any) -> None:
    script = _launchd_script()
    if not script.exists():
        raise SystemExit(f"LaunchAgent installer not found: {script}")
    if sys.platform != "darwin":
        raise SystemExit("bridge-install-launchd is only available on macOS.")

    print(f"Installing GoChat Hermes LaunchAgent: {script}")
    raise SystemExit(subprocess.call(["/bin/bash", str(script)], env=_bridge_env(args)))


def _add_common_connection_args(parser: Any) -> None:
    parser.add_argument("--server", default=DEFAULT_SERVER, help=f"ClawTile server URL (default: {DEFAULT_SERVER})")
    parser.add_argument("--code", default="", help="ClawTile mini-program pairing code. Exchanges and saves a token without shell history exposure.")
    parser.add_argument("--display-name", default="Hermes Agent", help="Display name shown in ClawTile after pairing.")
    parser.add_argument("--token", default="", help="ClawTile agent bearer token. Prefer CLAWTILE_TOKEN for shell history safety.")
    parser.add_argument("--no-prompt", action="store_true", help="Fail instead of prompting for a missing token.")


def _setup_cli(parser: Any) -> None:
    sub = parser.add_subparsers(dest="gochat_action")

    status = sub.add_parser("status", help="Show GoChat plugin and connection status")
    status.add_argument("--name", default=DEFAULT_MCP_NAME, help="Hermes MCP server name")
    status.add_argument("--env-key", default=DEFAULT_MCP_ENV, help="Hermes .env key for the ClawTile token")
    status.set_defaults(gochat_func=_cmd_status)

    mcp = sub.add_parser("mcp-configure", help="Configure ClawTile Agent MCP tools in Hermes")
    _add_common_connection_args(mcp)
    mcp.add_argument("--name", default=DEFAULT_MCP_NAME, help="Hermes MCP server name")
    mcp.add_argument("--env-key", default=DEFAULT_MCP_ENV, help="Hermes .env key for the ClawTile token")
    mcp.set_defaults(gochat_func=_cmd_mcp_configure)

    run = sub.add_parser("bridge-run", help="Run the always-on ClawTile -> Hermes bridge in the foreground")
    _add_common_connection_args(run)
    run.add_argument("--hermes-bin", default="", help="Hermes executable path (default: hermes)")
    run.add_argument("--model", default="", help="Optional Hermes model override for hermes -z")
    run.add_argument("--log", default="", help="Bridge log path")
    run.add_argument("--max-transcript-chars", type=int, default=20000, help="Transcript character limit per run")
    run.add_argument("--once", default="", help="Process one recording id and exit")
    run.set_defaults(gochat_func=_cmd_bridge_run)

    launchd = sub.add_parser("bridge-install-launchd", help="Install the always-on bridge as a macOS LaunchAgent")
    _add_common_connection_args(launchd)
    launchd.add_argument("--hermes-bin", default="", help="Hermes executable path (default: hermes)")
    launchd.add_argument("--model", default="", help="Optional Hermes model override")
    launchd.add_argument("--log", default="", help="Bridge log path")
    launchd.add_argument("--max-transcript-chars", type=int, default=20000, help="Transcript character limit per run")
    launchd.set_defaults(gochat_func=_cmd_bridge_install_launchd)

    skills = sub.add_parser("install-skills", help="Copy bundled GoChat skills into Hermes skills directory")
    skills.add_argument("--skills-dir", default="", help="Target skills directory (default: ~/.hermes/skills)")
    skills.set_defaults(gochat_func=_cmd_install_skills)


def _handle_cli(args: Any) -> None:
    fn = getattr(args, "gochat_func", None)
    if fn is None:
        print("Use `hermes gochat --help` for commands.")
        return
    fn(args)


# ---- ClawTile gateway platform adapter (merged so one install does it all) ----
# Lives in this same plugin: register(ctx) registers the CLI command, the skill,
# AND a gateway messaging platform. `hermes gateway` loads this standalone plugin
# (it's in plugins.enabled) and honors register_platform — the platform gives the
# device chat a persistent per-conversation Hermes session (real multi-turn),
# unlike the one-shot `hermes -z` bridge. Keep ALL gateway/httpx imports lazy so
# loading this plugin in the CLI context never pulls gateway modules.

_clawtile_adapter_mod = None


def _clawtile_base_token() -> "tuple[str, str]":
    base = (os.environ.get("CLAWTILE_AGENT_BASE") or "").strip().rstrip("/") or _agent_base(DEFAULT_SERVER)
    token = (os.environ.get("CLAWTILE_TOKEN") or os.environ.get(DEFAULT_MCP_ENV) or "").strip()
    if not token:
        try:
            from hermes_cli.config import get_env_value

            token = (get_env_value(DEFAULT_MCP_ENV) or "").strip()
        except Exception:
            token = ""
    return base, token


def _clawtile_check() -> bool:
    try:
        import httpx  # noqa: F401
    except Exception:
        return False
    _, token = _clawtile_base_token()
    return bool(token)


def _clawtile_validate(config: Any) -> bool:
    extra = getattr(config, "extra", {}) or {}
    base, token = _clawtile_base_token()
    token = token or str(extra.get("token") or "").strip()
    return bool(base and token)


def _clawtile_env_enablement() -> "dict | None":
    base, token = _clawtile_base_token()
    if base and token:
        return {"agent_base": base, "token": token}
    return None


def _make_clawtile_adapter(cfg: Any):
    # Lazy file-path load so __init__.py never imports gateway/httpx at module
    # load time (which would break the CLI-context plugin load).
    global _clawtile_adapter_mod
    if _clawtile_adapter_mod is None:
        import importlib.util

        path = _plugin_dir() / "clawtile_platform.py"
        spec = importlib.util.spec_from_file_location("gochat_clawtile_platform", path)
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        _clawtile_adapter_mod = mod
    return _clawtile_adapter_mod.ClawtileAdapter(cfg)


def register(ctx: Any) -> None:
    skill = _plugin_dir() / "skills" / "clawtile-hermes-online" / "SKILL.md"
    if skill.exists():
        ctx.register_skill(
            "clawtile-hermes-online",
            skill,
            "Operate ClawTile online from Hermes Agent via MCP or SSE bridge.",
        )

    ctx.register_cli_command(
        "gochat",
        help="Configure and run GoChat / ClawTile integration",
        description="Hermes-native GoChat / ClawTile plugin commands.",
        setup_fn=_setup_cli,
        handler_fn=_handle_cli,
    )

    # Gateway messaging platform — persistent device-chat sessions + streaming.
    # check_fn/env_enablement reuse the token `mcp-configure` already saved to
    # ~/.hermes/.env, so binding once is enough; no extra config needed.
    try:
        ctx.register_platform(
            name="clawtile",
            label="ClawTile",
            adapter_factory=_make_clawtile_adapter,
            check_fn=_clawtile_check,
            validate_config=_clawtile_validate,
            required_env=["CLAWTILE_TOKEN"],
            install_hint="Bind with `hermes gochat mcp-configure --code <code>`; the token is reused automatically.",
            emoji="🐱",
            env_enablement_fn=_clawtile_env_enablement,
            platform_hint=(
                "你正在通过 ClawTile 硬件(墨水屏小设备)和用户对话,用户的话是语音转成的文字。"
                "回复用简洁中文、先给结论,不要代码块或长篇;需要时调用工具完成任务。"
            ),
        )
    except AttributeError:
        # Older hosts without register_platform: CLI + skill still work.
        pass
