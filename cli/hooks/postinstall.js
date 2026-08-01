const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const cliDir = path.resolve(__dirname, "..");
process.env.NINEROUTER_CLI_ROOT ||= cliDir;
const builtPostinstall = path.join(cliDir, "dist", "hooks", "postinstall.js");
if (!fs.existsSync(builtPostinstall)) {
  execFileSync(process.execPath, [path.join(cliDir, "scripts", "build-sources.mjs")], {
    cwd: cliDir,
    stdio: "inherit",
  });
}
require(builtPostinstall);
