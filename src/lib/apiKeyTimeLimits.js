export const VIETNAM_TIME_ZONE = "Asia/Ho_Chi_Minh";
export const VIETNAM_UTC_OFFSET_MS = 7 * 60 * 60 * 1000;
export const DEFAULT_DAILY_RESET_TIME = "00:00";
export const DEFAULT_HOURLY_RESET_MINUTE = 0;

export function parseDailyResetTime(value) {
  if (value === undefined || value === null || value === "") {
    return DEFAULT_DAILY_RESET_TIME;
  }

  const normalized = String(value).trim();
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(normalized)) {
    throw new TypeError("Daily reset time must use HH:mm in Vietnam time");
  }
  return normalized;
}

export function parseHourlyResetMinute(value) {
  if (value === undefined || value === null || value === "") {
    return DEFAULT_HOURLY_RESET_MINUTE;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 59) {
    throw new TypeError("Hourly reset minute must be an integer from 0 to 59");
  }
  return parsed;
}

function asDate(now) {
  const date = now instanceof Date ? new Date(now.getTime()) : new Date(now);
  if (Number.isNaN(date.getTime())) throw new TypeError("Invalid quota window date");
  return date;
}

export function getDailyQuotaWindow(resetTime = DEFAULT_DAILY_RESET_TIME, now = new Date()) {
  const current = asDate(now);
  const [hour, minute] = parseDailyResetTime(resetTime).split(":").map(Number);
  const vietnamNow = new Date(current.getTime() + VIETNAM_UTC_OFFSET_MS);
  let startMs = Date.UTC(
    vietnamNow.getUTCFullYear(),
    vietnamNow.getUTCMonth(),
    vietnamNow.getUTCDate(),
    hour,
    minute
  ) - VIETNAM_UTC_OFFSET_MS;

  if (current.getTime() < startMs) startMs -= 24 * 60 * 60 * 1000;
  return {
    start: new Date(startMs).toISOString(),
    end: new Date(startMs + 24 * 60 * 60 * 1000).toISOString(),
  };
}

export function getHourlyQuotaWindow(resetMinute = DEFAULT_HOURLY_RESET_MINUTE, now = new Date()) {
  const current = asDate(now);
  const minute = parseHourlyResetMinute(resetMinute);
  const vietnamNow = new Date(current.getTime() + VIETNAM_UTC_OFFSET_MS);
  let startMs = Date.UTC(
    vietnamNow.getUTCFullYear(),
    vietnamNow.getUTCMonth(),
    vietnamNow.getUTCDate(),
    vietnamNow.getUTCHours(),
    minute
  ) - VIETNAM_UTC_OFFSET_MS;

  if (current.getTime() < startMs) startMs -= 60 * 60 * 1000;
  return {
    start: new Date(startMs).toISOString(),
    end: new Date(startMs + 60 * 60 * 1000).toISOString(),
  };
}
