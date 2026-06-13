// Build the GoChat OpenClaw extension to compiled JS in dist/.
//
// OpenClaw 6.x requires plugins to ship compiled runtime output (./dist/index.js)
// — `openclaw plugins install` rejects raw TypeScript entries. This bundles the
// two manifest entrypoints (the channel + its setup surface) into dist/, keeping
// the OpenClaw host packages external (resolved by the running gateway at
// runtime; they must NOT be bundled) while inlining the plugin's own deps (ws).
//
// CLI subcommands (`openclaw gochat bind-agent` ...) are wired by src/cli.ts,
// which index.ts imports and builds from its registerCliMetadata() hook — the
// hook OpenClaw 6.x loads at the CLI parse phase. So cli.ts is bundled into
// dist/index.js; there is no separate CLI entry to emit.
import { build } from "esbuild";

await build({
  entryPoints: ["index.ts", "setup-entry.ts"],
  outdir: "dist",
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node20",
  // The gateway provides everything under `openclaw/*` at runtime.
  external: ["openclaw", "openclaw/*"],
  logLevel: "info",
});
console.log("built dist/index.js + dist/setup-entry.js");
