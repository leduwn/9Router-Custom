import { describe, expect, it, vi } from "vitest";
import fs from "fs";
import os from "os";
import path from "path";

async function loadRootCAWithDataDir(dataDir) {
  const oldDataDir = process.env.DATA_DIR;
  process.env.DATA_DIR = dataDir;
  vi.resetModules();
  try {
    return await import("../../src/mitm/cert/rootCA");
  } finally {
    if (oldDataDir === undefined) delete process.env.DATA_DIR;
    else process.env.DATA_DIR = oldDataDir;
  }
}

describe("MITM Root CA generation", () => {
  it("creates Root CA files synchronously for direct server startup", async () => {
    const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "9router-mitm-ca-"));
    const { generateRootCA } = await loadRootCAWithDataDir(dataDir);

    generateRootCA();

    expect(fs.existsSync(path.join(dataDir, "mitm", "rootCA.key"))).toBe(true);
    expect(fs.existsSync(path.join(dataDir, "mitm", "rootCA.crt"))).toBe(true);
  });
});
