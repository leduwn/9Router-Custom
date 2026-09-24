import { v4 as uuidv4 } from "uuid";
import { getAdapter } from "../driver.js";
import { parseTokenLimit } from "../../apiKeyLimits.js";
import {
  getDailyQuotaWindow,
  getHourlyQuotaWindow,
  parseDailyResetTime,
  parseHourlyResetMinute,
  VIETNAM_TIME_ZONE,
} from "../../apiKeyTimeLimits.js";

function rowToKey(row) {
  if (!row) return null;
  return {
    id: row.id,
    key: row.key,
    name: row.name,
    machineId: row.machineId,
    isActive: row.isActive === 1 || row.isActive === true,
    tokenLimit: row.tokenLimit == null ? null : Number(row.tokenLimit),
    usedTokens: Number(row.usedTokens) || 0,
    allowedModels: row.allowedModels || null,
    dailyTokenLimit: row.dailyTokenLimit == null ? null : Number(row.dailyTokenLimit),
    dailyResetTime: row.dailyResetTime || "00:00",
    hourlyTokenLimit: row.hourlyTokenLimit == null ? null : Number(row.hourlyTokenLimit),
    hourlyResetMinute: row.hourlyResetMinute == null ? 0 : Number(row.hourlyResetMinute),
    createdAt: row.createdAt,
  };
}

function getWindowUsedTokens(db, apiKey, window) {
  const row = db.get(
    `SELECT COALESCE(SUM(COALESCE(promptTokens, 0) + COALESCE(completionTokens, 0)), 0) AS usedTokens
     FROM usageHistory
     WHERE apiKey = ? AND timestamp >= ? AND timestamp < ?`,
    [apiKey, window.start, window.end]
  );
  return Number(row?.usedTokens) || 0;
}

export function getApiKeyQuotaUsageWithAdapter(db, keyInfo, now = new Date()) {
  if (!keyInfo) return null;
  const dailyWindow = getDailyQuotaWindow(keyInfo.dailyResetTime, now);
  const hourlyWindow = getHourlyQuotaWindow(keyInfo.hourlyResetMinute, now);
  return {
    dailyUsedTokens: keyInfo.dailyTokenLimit == null
      ? 0
      : getWindowUsedTokens(db, keyInfo.key, dailyWindow),
    dailyWindowStart: dailyWindow.start,
    dailyResetAt: dailyWindow.end,
    hourlyUsedTokens: keyInfo.hourlyTokenLimit == null
      ? 0
      : getWindowUsedTokens(db, keyInfo.key, hourlyWindow),
    hourlyWindowStart: hourlyWindow.start,
    hourlyResetAt: hourlyWindow.end,
    quotaTimeZone: VIETNAM_TIME_ZONE,
  };
}

function withQuotaUsage(db, row, now = new Date()) {
  const keyInfo = rowToKey(row);
  return keyInfo ? { ...keyInfo, ...getApiKeyQuotaUsageWithAdapter(db, keyInfo, now) } : null;
}

export async function getApiKeys() {
  const db = await getAdapter();
  const rows = db.all(`SELECT * FROM apiKeys ORDER BY createdAt ASC`);
  const now = new Date();
  return rows.map((row) => withQuotaUsage(db, row, now));
}

export async function getApiKeyById(id) {
  const db = await getAdapter();
  const row = db.get(`SELECT * FROM apiKeys WHERE id = ?`, [id]);
  return withQuotaUsage(db, row);
}

export async function getApiKeyByKey(key) {
  const db = await getAdapter();
  const row = db.get(`SELECT * FROM apiKeys WHERE key = ?`, [key]);
  return withQuotaUsage(db, row);
}

export async function createApiKey(
  name,
  machineId,
  tokenLimit = null,
  allowedModels = null,
  dailyTokenLimit = null,
  dailyResetTime = "00:00",
  hourlyTokenLimit = null,
  hourlyResetMinute = 0
) {
  if (!machineId) throw new Error("machineId is required");
  const normalizedTokenLimit = parseTokenLimit(tokenLimit) ?? null;
  const normalizedDailyTokenLimit = parseTokenLimit(dailyTokenLimit) ?? null;
  const normalizedDailyResetTime = parseDailyResetTime(dailyResetTime);
  const normalizedHourlyTokenLimit = parseTokenLimit(hourlyTokenLimit) ?? null;
  const normalizedHourlyResetMinute = parseHourlyResetMinute(hourlyResetMinute);
  const db = await getAdapter();
  const { generateApiKeyWithMachine } = await import("@/shared/utils/apiKey");
  const result = generateApiKeyWithMachine(machineId);
  const apiKey = {
    id: uuidv4(),
    name,
    key: result.key,
    machineId,
    isActive: true,
    tokenLimit: normalizedTokenLimit,
    usedTokens: 0,
    allowedModels: allowedModels || null,
    dailyTokenLimit: normalizedDailyTokenLimit,
    dailyResetTime: normalizedDailyResetTime,
    hourlyTokenLimit: normalizedHourlyTokenLimit,
    hourlyResetMinute: normalizedHourlyResetMinute,
    createdAt: new Date().toISOString(),
  };
  db.run(
    `INSERT INTO apiKeys(
      id, key, name, machineId, isActive, tokenLimit, usedTokens, allowedModels,
      dailyTokenLimit, dailyResetTime, hourlyTokenLimit, hourlyResetMinute, createdAt
    ) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      apiKey.id, apiKey.key, apiKey.name, apiKey.machineId, 1, apiKey.tokenLimit, 0,
      apiKey.allowedModels, apiKey.dailyTokenLimit, apiKey.dailyResetTime,
      apiKey.hourlyTokenLimit, apiKey.hourlyResetMinute, apiKey.createdAt,
    ]
  );
  return { ...apiKey, ...getApiKeyQuotaUsageWithAdapter(db, apiKey) };
}

export async function updateApiKey(id, data) {
  const db = await getAdapter();
  let result = null;
  db.transaction(() => {
    const row = db.get(`SELECT * FROM apiKeys WHERE id = ?`, [id]);
    if (!row) return;
    const normalizedData = { ...data };
    if (Object.hasOwn(normalizedData, "tokenLimit")) {
      normalizedData.tokenLimit = parseTokenLimit(normalizedData.tokenLimit);
    }
    if (Object.hasOwn(normalizedData, "dailyTokenLimit")) {
      normalizedData.dailyTokenLimit = parseTokenLimit(normalizedData.dailyTokenLimit);
    }
    if (Object.hasOwn(normalizedData, "dailyResetTime")) {
      normalizedData.dailyResetTime = parseDailyResetTime(normalizedData.dailyResetTime);
    }
    if (Object.hasOwn(normalizedData, "hourlyTokenLimit")) {
      normalizedData.hourlyTokenLimit = parseTokenLimit(normalizedData.hourlyTokenLimit);
    }
    if (Object.hasOwn(normalizedData, "hourlyResetMinute")) {
      normalizedData.hourlyResetMinute = parseHourlyResetMinute(normalizedData.hourlyResetMinute);
    }
    const merged = { ...rowToKey(row), ...normalizedData };
    db.run(
      `UPDATE apiKeys SET
        key = ?, name = ?, machineId = ?, isActive = ?, tokenLimit = ?, usedTokens = ?, allowedModels = ?,
        dailyTokenLimit = ?, dailyResetTime = ?, hourlyTokenLimit = ?, hourlyResetMinute = ?
       WHERE id = ?`,
      [
        merged.key,
        merged.name,
        merged.machineId,
        merged.isActive ? 1 : 0,
        merged.tokenLimit,
        merged.usedTokens,
        merged.allowedModels,
        merged.dailyTokenLimit,
        merged.dailyResetTime,
        merged.hourlyTokenLimit,
        merged.hourlyResetMinute,
        id,
      ]
    );
    result = { ...merged, ...getApiKeyQuotaUsageWithAdapter(db, merged) };
  });
  return result;
}

export async function deleteApiKey(id) {
  const db = await getAdapter();
  const res = db.run(`DELETE FROM apiKeys WHERE id = ?`, [id]);
  return (res?.changes ?? 0) > 0;
}

export async function validateApiKey(key) {
  const db = await getAdapter();
  const row = db.get(`SELECT isActive FROM apiKeys WHERE key = ?`, [key]);
  if (!row) return false;
  return row.isActive === 1 || row.isActive === true;
}

export function incrementUsedTokensWithAdapter(db, key, amount) {
  const tokenCount = Number(amount);
  if (!key || !Number.isSafeInteger(tokenCount) || tokenCount <= 0) return 0;

  const result = db.run(
    `UPDATE apiKeys
     SET usedTokens = COALESCE(usedTokens, 0) + ?
     WHERE key = ?`,
    [tokenCount, key]
  );
  return Number(result?.changes || 0);
}

export async function incrementUsedTokens(key, amount) {
  const db = await getAdapter();
  return incrementUsedTokensWithAdapter(db, key, amount);
}
