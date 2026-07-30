import { existsSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import { dirname, extname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const textExtensions = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".jsx",
  ".md",
  ".mjs",
  ".svg",
  ".ts",
  ".tsx",
]);
const retiredBrand = [String.fromCharCode(57), "english"].join("");
const blockedUiPatterns = [
  {
    label: "retired English navigation label",
    pattern: new RegExp(
      `${retiredBrand[0]}[\\s_-]*${retiredBrand.slice(1)}`,
      "i",
    ),
  },
  {
    label: "retired English navigation URL",
    pattern: new RegExp(`${retiredBrand}\\.net`, "i"),
  },
];

function visitTextFiles(targetPath, callback) {
  const stats = statSync(targetPath);
  if (stats.isDirectory()) {
    const entries = readdirSync(targetPath, { withFileTypes: true })
      .sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      visitTextFiles(join(targetPath, entry.name), callback);
    }
    return;
  }

  if (textExtensions.has(extname(targetPath).toLowerCase())) {
    callback(targetPath);
  }
}

const violations = [];
for (const sourceRoot of ["public", "src"]) {
  visitTextFiles(join(projectRoot, sourceRoot), (filePath) => {
    const contents = readFileSync(filePath, "utf8");
    for (const blocked of blockedUiPatterns) {
      if (blocked.pattern.test(contents)) {
        violations.push(
          `${relative(projectRoot, filePath).replaceAll("\\", "/")}: ${blocked.label}`,
        );
      }
    }
  });
}

if (violations.length > 0) {
  throw new Error(
    `Blocked legacy UI references found:\n${violations.map((item) => `- ${item}`).join("\n")}`,
  );
}

const configuredDistDir = process.env.NEXT_DIST_DIR || ".next";
const distPath = resolve(projectRoot, configuredDistDir);
const relativeDistPath = relative(projectRoot, distPath);
const isDevPreparation = process.argv.includes("--dev");
const isInsideProject = relativeDistPath
  && !relativeDistPath.startsWith(`..${sep}`)
  && relativeDistPath !== ".."
  && !isAbsolute(relativeDistPath);
const isNextBuildDirectory = relativeDistPath
  .split(/[\\/]/)
  .every((segment, index) => index > 0 || segment.startsWith(".next"));

if (!isInsideProject || !isNextBuildDirectory) {
  throw new Error(`Refusing to clean unexpected build directory: ${distPath}`);
}

const cleanupPath = isDevPreparation ? join(distPath, "dev") : distPath;
const relativeCleanupPath = relative(projectRoot, cleanupPath);

if (existsSync(cleanupPath)) {
  rmSync(cleanupPath, {
    recursive: true,
    force: true,
    maxRetries: 3,
    retryDelay: 100,
  });
}

console.log(
  `[prepare] UI branding check passed; cleaned ${relativeCleanupPath.replaceAll("\\", "/")}`,
);
