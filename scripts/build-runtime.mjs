import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const runtimeDir = path.join(root, ".runtime");

fs.rmSync(runtimeDir, { recursive: true, force: true });
fs.mkdirSync(path.join(runtimeDir, "src", "mitm"), { recursive: true });
fs.mkdirSync(path.join(runtimeDir, "src", "lib", "updater"), { recursive: true });

const shared = {
  bundle: true,
  platform: "node",
  target: "node18",
  format: "cjs",
  sourcemap: false,
  logLevel: "info",
};

await Promise.all([
  build({
    ...shared,
    entryPoints: [path.join(root, "custom-server.ts")],
    outfile: path.join(runtimeDir, "custom-server.js"),
    external: ["./server.js"],
  }),
  build({
    ...shared,
    entryPoints: [path.join(root, "src", "mitm", "server.ts")],
    outfile: path.join(runtimeDir, "src", "mitm", "server.js"),
  }),
  build({
    ...shared,
    entryPoints: [path.join(root, "src", "lib", "updater", "updater.ts")],
    outfile: path.join(runtimeDir, "src", "lib", "updater", "updater.js"),
  }),
  build({
    bundle: true,
    platform: "browser",
    target: "es2022",
    format: "iife",
    sourcemap: false,
    logLevel: "info",
    entryPoints: [path.join(root, "src", "service-worker", "sw.ts")],
    outfile: path.join(root, "public", "sw.js"),
  }),
]);
