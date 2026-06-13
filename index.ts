import { defineChannelPluginEntry } from "openclaw/plugin-sdk/core";
import { gochatPlugin } from "./src/channel.js";
import { setGoChatRuntime } from "./src/runtime.js";
import { createGoChatTaskTool } from "./src/task-tools.js";
import { registerGochatCli } from "./src/cli.js";
import { GOCHAT_CLI_DESCRIPTORS } from "./src/cli-descriptors.js";

export { gochatPlugin } from "./src/channel.js";
export { setGoChatRuntime } from "./src/runtime.js";

export default defineChannelPluginEntry({
  id: "gochat",
  name: "GoChat",
  description: "Custom chat backend via HTTP webhook with Go server",
  plugin: gochatPlugin,
  setRuntime: setGoChatRuntime,
  // OpenClaw 6.x exposes plugin subcommands by loading THIS hook at the CLI
  // "cli-metadata" parse phase (not registerFull). It must build the FULL command
  // tree, or only `openclaw gochat` is recognized and `gochat bind-agent --code`
  // fails. registerFull() deliberately does NOT build the CLI: full mode runs
  // both hooks, so building it in both would double-register the `gochat` command.
  registerCliMetadata(api) {
    api.registerCli(
      ({ program }) => {
        registerGochatCli(program);
      },
      { descriptors: GOCHAT_CLI_DESCRIPTORS },
    );
  },
  registerFull(api) {
    api.registerTool(createGoChatTaskTool(), {
      name: "gochat_tasks",
    });
  },
});
