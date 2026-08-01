export function parseJson(str: unknown, fallback: any = null): any {
  if (str == null) return fallback;
  if (typeof str !== "string") return str;
  try { return JSON.parse(str); } catch { return fallback; }
}

export function stringifyJson(value: unknown): string {
  return JSON.stringify(value ?? null);
}
