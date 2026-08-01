import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let tempDir;
const originalDataDir = process.env.DATA_DIR;

beforeEach(() => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "9router-token-limit-"));
  process.env.DATA_DIR = tempDir;
  delete global._dbAdapter;
  vi.resetModules();
});

afterEach(() => {
  try {
    global._dbAdapter?.instance?.close?.();
  } catch {}
  delete global._dbAdapter;
  if (tempDir) fs.rmSync(tempDir, { recursive: true, force: true });
  if (originalDataDir === undefined) delete process.env.DATA_DIR;
  else process.env.DATA_DIR = originalDataDir;
});

describe("API key token limits", () => {
  it("creates the quota columns with safe defaults", async () => {
    const { getAdapter } = await import("@/lib/db/driver");
    const db = await getAdapter();
    const columns = Object.fromEntries(
      db.all("PRAGMA table_info(apiKeys)").map((column) => [column.name, column])
    );

    expect(columns.tokenLimit).toBeDefined();
    expect(columns.usedTokens).toBeDefined();
    expect(String(columns.usedTokens.dflt_value)).toBe("0");
  });

  it("persists limits and atomically increments usage only once per stored request", async () => {
    const { createApiKey, getApiKeyById } = await import("@/lib/db/repos/apiKeysRepo");
    const { saveRequestUsage } = await import("@/lib/db/repos/usageRepo");

    const key = await createApiKey("Limited", "machine-test", 100);
    expect(key.tokenLimit).toBe(100);
    expect(key.usedTokens).toBe(0);

    const usage = {
      timestamp: "2026-07-31T00:00:00.000Z",
      provider: "openai",
      model: "gpt-test",
      connectionId: "connection-test",
      apiKey: key.key,
      endpoint: "/v1/chat/completions",
      tokens: {
        prompt_tokens: 12,
        completion_tokens: 8,
        total_tokens: 20,
      },
    };

    await saveRequestUsage({ ...usage });
    expect((await getApiKeyById(key.id)).usedTokens).toBe(20);

    await saveRequestUsage({ ...usage });
    expect((await getApiKeyById(key.id)).usedTokens).toBe(20);

    await saveRequestUsage({
      ...usage,
      timestamp: "2026-07-31T00:00:01.000Z",
      tokens: { prompt_tokens: 5, completion_tokens: 5, total_tokens: 10 },
    });
    expect((await getApiKeyById(key.id)).usedTokens).toBe(30);
  });

  it("returns 429 access metadata after the limit is reached", async () => {
    const {
      createApiKey,
      incrementUsedTokens,
      updateApiKey,
    } = await import("@/lib/db/repos/apiKeysRepo");
    const { getApiKeyAccess } = await import("@/sse/services/auth");

    const key = await createApiKey("Limited", "machine-test", 10);
    expect((await getApiKeyAccess(key.key)).valid).toBe(true);

    await incrementUsedTokens(key.key, 10);
    const exhausted = await getApiKeyAccess(key.key);
    expect(exhausted).toMatchObject({
      valid: false,
      status: 429,
      reason: "token_limit_exceeded",
      message: "Token limit exceeded",
    });

    await updateApiKey(key.id, { tokenLimit: null });
    expect((await getApiKeyAccess(key.key)).valid).toBe(true);
  }, 15000);
});
