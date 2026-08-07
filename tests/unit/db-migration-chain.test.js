// Verify schema migration chain runs correctly across versions.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

let tempDir;
const originalDataDir = process.env.DATA_DIR;

beforeEach(() => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "9router-mig-"));
  process.env.DATA_DIR = tempDir;
  // Reset global singleton so each test gets fresh adapter pointed at tempDir
  delete global._dbAdapter;
  vi.resetModules();
});

afterEach(() => {
  // Close adapter to release file handles before rm
  try { global._dbAdapter?.instance?.close?.(); } catch {}
  delete global._dbAdapter;
  if (tempDir) fs.rmSync(tempDir, { recursive: true, force: true });
  if (originalDataDir === undefined) delete process.env.DATA_DIR;
  else process.env.DATA_DIR = originalDataDir;
});

describe("Schema migrations", () => {
  it("fresh DB → applies migrations & stamps schemaVersion", async () => {
    const { getAdapter } = await import("@/lib/db/driver.js");
    const { latestVersion } = await import("@/lib/db/migrations/index.js");
    const db = await getAdapter();
    const row = db.get(`SELECT value FROM _meta WHERE key='schemaVersion'`);
    expect(parseInt(row.value, 10)).toBe(latestVersion());

    const tables = db.all(`SELECT name FROM sqlite_master WHERE type='table'`).map(t => t.name);
    expect(tables).toEqual(expect.arrayContaining([
      "_meta", "settings", "providerConnections", "providerNodes",
      "proxyPools", "apiKeys", "combos", "kv", "usageHistory", "usageDaily", "requestDetails",
    ]));
  });

  it("existing DB at older schemaVersion → re-applies pending migrations on restart", async () => {
    // 1st boot
    const { getAdapter } = await import("@/lib/db/driver.js");
    const db = await getAdapter();
    db.run(`INSERT INTO settings(id, data) VALUES(1, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data`, ['{"foo":"bar"}']);
    db.run(`UPDATE _meta SET value = '0' WHERE key = 'schemaVersion'`);
    db.close?.();

    // 2nd boot: full reset to simulate process restart
    delete global._dbAdapter;
    vi.resetModules();
    const { getAdapter: getAdapter2 } = await import("@/lib/db/driver.js");
    const { latestVersion } = await import("@/lib/db/migrations/index.js");
    const db2 = await getAdapter2();
    const row = db2.get(`SELECT value FROM _meta WHERE key='schemaVersion'`);
    expect(parseInt(row.value, 10)).toBe(latestVersion());

    const settings = db2.get(`SELECT data FROM settings WHERE id=1`);
    expect(JSON.parse(settings.data)).toEqual({ foo: "bar" });
  });

  it("upstream schema 1 DB → adds custom API key columns without losing keys", async () => {
    const { getAdapter } = await import("@/lib/db/driver.js");
    const db = await getAdapter();

    db.exec(`ALTER TABLE apiKeys DROP COLUMN allowedModels`);
    db.exec(`ALTER TABLE apiKeys DROP COLUMN usedTokens`);
    db.exec(`ALTER TABLE apiKeys DROP COLUMN tokenLimit`);
    db.run(
      `INSERT INTO apiKeys(id, key, name, machineId, isActive, createdAt) VALUES(?, ?, ?, ?, ?, ?)`,
      ["upstream-key", "sk-upstream", "Upstream", "machine-1", 1, "2026-08-08T00:00:00.000Z"]
    );
    db.run(`INSERT OR REPLACE INTO _meta(key, value) VALUES('schemaVersion', '1')`);
    db.run(`INSERT OR REPLACE INTO _meta(key, value) VALUES('backupSchemaVersion', '1')`);
    db.close?.();

    delete global._dbAdapter;
    vi.resetModules();
    const { getAdapter: getAdapter2 } = await import("@/lib/db/driver.js");
    const db2 = await getAdapter2();
    const key = db2.get(`SELECT * FROM apiKeys WHERE id = 'upstream-key'`);

    expect(key).toMatchObject({
      key: "sk-upstream",
      tokenLimit: null,
      usedTokens: 0,
      allowedModels: null,
    });
  });

  it("current Duwn DB → keeps API key policy fields across repeated boots", async () => {
    const { getAdapter } = await import("@/lib/db/driver.js");
    const db = await getAdapter();
    db.run(
      `INSERT INTO apiKeys(id, key, name, machineId, isActive, tokenLimit, usedTokens, allowedModels, createdAt) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ["duwn-key", "sk-duwn", "Duwn", "machine-1", 1, 500, 125, "openai/gpt-5.6", "2026-08-08T00:00:00.000Z"]
    );
    db.close?.();

    for (let boot = 0; boot < 2; boot += 1) {
      delete global._dbAdapter;
      vi.resetModules();
      const { getAdapter: getAdapterAgain } = await import("@/lib/db/driver.js");
      const reopened = await getAdapterAgain();
      expect(reopened.get(`SELECT * FROM apiKeys WHERE id = 'duwn-key'`)).toMatchObject({
        tokenLimit: 500,
        usedTokens: 125,
        allowedModels: "openai/gpt-5.6",
      });
      reopened.close?.();
    }
  });

  it("fresh DB + legacy db.json → imports data automatically", async () => {
    // Simulate user upgrading: place legacy JSON in DATA_DIR before first boot
    const legacy = {
      settings: { foo: "legacy-value" },
      apiKeys: [{
        id: "k1",
        key: "abc",
        name: "test",
        tokenLimit: 100,
        usedTokens: 25,
        allowedModels: "openai/gpt-5.6",
        createdAt: new Date().toISOString(),
      }],
      modelAliases: { "gpt-4": "gpt-4-turbo" },
    };
    fs.writeFileSync(path.join(tempDir, "db.json"), JSON.stringify(legacy));

    const { getAdapter } = await import("@/lib/db/driver.js");
    const db = await getAdapter();

    const settings = db.get(`SELECT data FROM settings WHERE id=1`);
    expect(JSON.parse(settings.data)).toEqual({ foo: "legacy-value" });

    const keys = db.all(`SELECT * FROM apiKeys`);
    expect(keys).toHaveLength(1);
    expect(keys[0].key).toBe("abc");
    expect(keys[0].tokenLimit).toBe(100);
    expect(keys[0].usedTokens).toBe(25);
    expect(keys[0].allowedModels).toBe("openai/gpt-5.6");

    const aliases = db.all(`SELECT * FROM kv WHERE scope='modelAliases'`);
    expect(aliases).toHaveLength(1);
  });

  it("auto-sync re-creates missing index when DB lacks it", async () => {
    const { getAdapter } = await import("@/lib/db/driver.js");
    const db = await getAdapter();
    db.exec(`DROP INDEX IF EXISTS idx_pn_type`);
    expect(db.all(`PRAGMA index_list(providerNodes)`).map(i => i.name)).not.toContain("idx_pn_type");
    db.close?.();

    delete global._dbAdapter;
    vi.resetModules();
    const { getAdapter: getAdapter2 } = await import("@/lib/db/driver.js");
    const db2 = await getAdapter2();
    const idx = db2.all(`PRAGMA index_list(providerNodes)`).map(i => i.name);
    expect(idx).toContain("idx_pn_type");
  });
});
