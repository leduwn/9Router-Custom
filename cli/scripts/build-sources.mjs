import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const cliDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(cliDir, "dist");

fs.rmSync(outputDir, { recursive: true, force: true });

const sourceEntries = [];
for (const relativeRoot of ["hooks", "src", "scripts"]) {
  const absoluteRoot = path.join(cliDir, relativeRoot);
  const stack = [absoluteRoot];
  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const absolutePath = path.join(current, entry.name);
      if (absolutePath === path.join(cliDir, "scripts", "build-sources.mjs")) continue;
      if (entry.isDirectory()) stack.push(absolutePath);
      else if (entry.isFile() && entry.name.endsWith(".ts")) sourceEntries.push(absolutePath);
    }
  }
}

await build({
  entryPoints: [path.join(cliDir, "cli.ts"), ...sourceEntries],
  outbase: cliDir,
  outdir: outputDir,
  platform: "node",
  target: "node18",
  format: "cjs",
  bundle: false,
  sourcemap: false,
  logLevel: "info",
});

fs.copyFileSync(path.join(cliDir, "package.json"), path.join(outputDir, "package.json"));
for (const asset of [
  ["src/cli/tray/tray.ps1", "src/cli/tray/tray.ps1"],
  ["src/cli/tray/icon.ico", "src/cli/tray/icon.ico"],
  ["src/cli/tray/icon.png", "src/cli/tray/icon.png"],
]) {
  const source = path.join(cliDir, asset[0]);
  const destination = path.join(outputDir, asset[1]);
  if (!fs.existsSync(source)) continue;
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}
