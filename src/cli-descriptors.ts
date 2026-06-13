// CLI command descriptors for the `gochat` subcommands.
//
// OpenClaw 6.x builds its command tree from these descriptors at a "cli-metadata"
// parse phase (the channel entry's registerCliMetadata() hook, see index.ts).
// Every subcommand that registerGochatCli (src/cli.ts) wires MUST have a matching
// descriptor here, or that command stays lazy and the parser won't fully expose
// it — which is how `openclaw gochat bind-agent` silently broke on 2026.6.x when
// the subcommands lived only in the runtime-only registerFull() hook.
export interface GochatCliDescriptor {
  name: string;
  description: string;
  hasSubcommands: boolean;
}

export const GOCHAT_CLI_DESCRIPTORS: GochatCliDescriptor[] = [
  {
    name: "gochat",
    description: "GoChat custom backend management",
    hasSubcommands: true,
  },
  {
    name: "gochat show-credentials",
    description: "Display connection ID and secret key",
    hasSubcommands: false,
  },
  {
    name: "gochat bind-agent",
    description: "Bind OpenClaw to ClawTile using a mini-program pairing code",
    hasSubcommands: false,
  },
  {
    name: "gochat authorize-mode-switch",
    description: "Authorize the next GoChat mode switch",
    hasSubcommands: false,
  },
  {
    name: "gochat approve-local-repair",
    description: "Approve the pending safe local CLI repair request used by GoChat subagent actions",
    hasSubcommands: false,
  },
  {
    name: "gochat ensure-gateway-access",
    description: "Manually normalize loopback gateway routing and approve safe local CLI repair requests",
    hasSubcommands: false,
  },
];
