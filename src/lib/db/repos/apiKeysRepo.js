import { v4 as uuidv4 } from "uuid";
import { getAdapter } from "../driver.js";
import { parseTokenLimit } from "../../apiKeyLimits.js";

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
    createdAt: row.createdAt,
  };
}

export async function getApiKeys() {
  const db = await getAdapter();
  const rows = db.all(`SELECT * FROM apiKeys ORDER BY createdAt ASC`);
  return rows.map(rowToKey);
}

export async function getApiKeyById(id) {
  const db = await getAdapter();
  const row = db.get(`SELECT * FROM apiKeys WHERE id = ?`, [id]);
  return rowToKey(row);
}

export async function getApiKeyByKey(key) {
  const db = await getAdapter();
  const row = db.get(`SELECT * FROM apiKeys WHERE key = ?`, [key]);
  return rowToKey(row);
}

export async function createApiKey(name, machineId, tokenLimit = null) {
  if (!machineId) throw new Error("machineId is required");
  const normalizedTokenLimit = parseTokenLimit(tokenLimit) ?? null;
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
    createdAt: new Date().toISOString(),
  };
  db.run(
    `INSERT INTO apiKeys(id, key, name, machineId, isActive, tokenLimit, usedTokens, createdAt) VALUES(?, ?, ?, ?, ?, ?, ?, ?)`,
    [apiKey.id, apiKey.key, apiKey.name, apiKey.machineId, 1, apiKey.tokenLimit, 0, apiKey.createdAt]
  );
  return apiKey;
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
    const merged = { ...rowToKey(row), ...normalizedData };
    db.run(
      `UPDATE apiKeys SET key = ?, name = ?, machineId = ?, isActive = ?, tokenLimit = ?, usedTokens = ? WHERE id = ?`,
      [
        merged.key,
        merged.name,
        merged.machineId,
        merged.isActive ? 1 : 0,
        merged.tokenLimit,
        merged.usedTokens,
        id,
      ]
    );
    result = merged;
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
