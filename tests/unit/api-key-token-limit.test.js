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
    const { getAdapter } = await import("@/lib/db/driver.js");
    const db = await getAdapter();
    const columns = Object.fromEntries(
      db.all("PRAGMA table_info(apiKeys)").map((column) => [column.name, column])
    );

    expect(columns.tokenLimit).toBeDefined();
    expect(columns.usedTokens).toBeDefined();
    expect(columns.allowedModels).toBeDefined();
    expect(columns.dailyTokenLimit).toBeDefined();
    expect(columns.dailyResetTime).toBeDefined();
    expect(columns.hourlyTokenLimit).toBeDefined();
    expect(columns.hourlyResetMinute).toBeDefined();
    expect(String(columns.usedTokens.dflt_value)).toBe("0");
    expect(String(columns.dailyResetTime.dflt_value)).toBe("'00:00'");
    expect(String(columns.hourlyResetMinute.dflt_value)).toBe("0");
  });

  it("calculates daily and hourly windows using Vietnam time", async () => {
    const { getDailyQuotaWindow, getHourlyQuotaWindow } = await import("@/lib/apiKeyTimeLimits.js");

    expect(getDailyQuotaWindow("08:00", "2026-08-10T01:30:00.000Z")).toEqual({
      start: "2026-08-10T01:00:00.000Z",
      end: "2026-08-11T01:00:00.000Z",
    });
    expect(getDailyQuotaWindow("08:00", "2026-08-10T00:30:00.000Z")).toEqual({
      start: "2026-08-09T01:00:00.000Z",
      end: "2026-08-10T01:00:00.000Z",
    });
    expect(getHourlyQuotaWindow(15, "2026-08-10T01:30:00.000Z")).toEqual({
      start: "2026-08-10T01:15:00.000Z",
      end: "2026-08-10T02:15:00.000Z",
    });
  });

  it("persists limits and atomically increments usage only once per stored request", async () => {
    const { createApiKey, getApiKeyById } = await import("@/lib/db/repos/apiKeysRepo.js");
    const { saveRequestUsage } = await import("@/lib/db/repos/usageRepo.js");

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
      dedupeKey: "request-test-1",
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
      dedupeKey: "request-test-2",
      tokens: { prompt_tokens: 5, completion_tokens: 5, total_tokens: 10 },
    });
    expect((await getApiKeyById(key.id)).usedTokens).toBe(30);
  });

  it("returns 429 access metadata after the limit is reached", async () => {
    const {
      createApiKey,
      incrementUsedTokens,
      updateApiKey,
    } = await import("@/lib/db/repos/apiKeysRepo.js");
    const { getApiKeyAccess } = await import("@/sse/services/auth.js");

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

  it("enforces daily and hourly limits from usage history", async () => {
    const { createApiKey } = await import("@/lib/db/repos/apiKeysRepo.js");
    const { saveRequestUsage } = await import("@/lib/db/repos/usageRepo.js");
    const { getApiKeyAccess } = await import("@/sse/services/auth.js");
    const timestamp = new Date().toISOString();

    const dailyKey = await createApiKey(
      "Daily",
      "machine-test",
      null,
      null,
      10,
      "08:30"
    );
    await saveRequestUsage({
      timestamp,
      apiKey: dailyKey.key,
      dedupeKey: "daily-request",
      tokens: { prompt_tokens: 6, completion_tokens: 4, total_tokens: 10 },
    });
    expect(await getApiKeyAccess(dailyKey.key)).toMatchObject({
      valid: false,
      status: 429,
      reason: "daily_token_limit_exceeded",
      message: "Daily token limit exceeded",
    });

    const hourlyKey = await createApiKey(
      "Hourly",
      "machine-test",
      null,
      null,
      null,
      "00:00",
      5,
      15
    );
    await saveRequestUsage({
      timestamp,
      apiKey: hourlyKey.key,
      dedupeKey: "hourly-request",
      tokens: { prompt_tokens: 3, completion_tokens: 2, total_tokens: 5 },
    });
    expect(await getApiKeyAccess(hourlyKey.key)).toMatchObject({
      valid: false,
      status: 429,
      reason: "hourly_token_limit_exceeded",
      message: "Hourly token limit exceeded",
    });
  }, 15000);

  it("enforces allowed models and treats a blank rule as unrestricted", async () => {
    const { createApiKey } = await import("@/lib/db/repos/apiKeysRepo.js");
    const { getApiKeyAccess } = await import("@/sse/services/auth.js");

    const restricted = await createApiKey(
      "Restricted",
      "machine-test",
      null,
      "openai/gpt-5.6,gemini/gemini-3.1-pro"
    );
    expect((await getApiKeyAccess(restricted.key, "openai/gpt-5.6")).valid).toBe(true);
    expect(await getApiKeyAccess(restricted.key, "openai/gpt-5.5")).toMatchObject({
      valid: false,
      status: 403,
      reason: "model_not_allowed",
    });

    const unrestricted = await createApiKey("Unrestricted", "machine-test", null, "");
    expect((await getApiKeyAccess(unrestricted.key, "openai/gpt-5.5")).valid).toBe(true);
  });

  it("preserves limits, usage and allowed models through export/import", async () => {
    const {
      createApiKey,
      getApiKeyById,
      incrementUsedTokens,
    } = await import("@/lib/db/repos/apiKeysRepo.js");
    const { exportDb, importDb } = await import("@/lib/db/index.js");

    const key = await createApiKey(
      "Portable",
      "machine-test",
      500,
      "openai/gpt-5.6,gemini/gemini-3.1-pro",
      200,
      "06:45",
      50,
      20
    );
    await incrementUsedTokens(key.key, 125);

    const snapshot = await exportDb();
    expect(snapshot.apiKeys[0]).toMatchObject({
      tokenLimit: 500,
      usedTokens: 125,
      allowedModels: "openai/gpt-5.6,gemini/gemini-3.1-pro",
      dailyTokenLimit: 200,
      dailyResetTime: "06:45",
      hourlyTokenLimit: 50,
      hourlyResetMinute: 20,
    });

    await importDb(snapshot);
    expect(await getApiKeyById(key.id)).toMatchObject({
      tokenLimit: 500,
      usedTokens: 125,
      allowedModels: "openai/gpt-5.6,gemini/gemini-3.1-pro",
      dailyTokenLimit: 200,
      dailyResetTime: "06:45",
      hourlyTokenLimit: 50,
      hourlyResetMinute: 20,
    });
  });
});
