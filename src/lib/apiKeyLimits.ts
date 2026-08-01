export function parseTokenLimit(value) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === "string" && value.trim() === "") return null;
  if (typeof value === "boolean") {
    throw new TypeError("Token limit must be a non-negative integer or null");
  }

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 0) {
    throw new TypeError("Token limit must be a non-negative integer or null");
  }
  return parsed;
}
