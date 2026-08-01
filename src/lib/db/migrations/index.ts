// Migration registry — append new entries when schema changes.
// Each migration: { version: number, name: string, up(db): void }
// Versions MUST be unique and monotonically increasing.
import m001 from "./001-initial";
import m002 from "./002-add-api-key-limits";
import m003 from "./003-add-api-key-allowed-models";

export const MIGRATIONS = [m001, m002, m003].sort((a, b) => a.version - b.version);

export function latestVersion() {
  return MIGRATIONS.length ? MIGRATIONS[MIGRATIONS.length - 1].version : 0;
}
