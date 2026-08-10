function hasColumn(db, tableName, columnName) {
  return db
    .all(`PRAGMA table_info(${tableName})`)
    .some((column) => column.name === columnName);
}

const migration = {
  version: 4,
  name: "add-api-key-time-limits",
  up(db) {
    if (!hasColumn(db, "apiKeys", "dailyTokenLimit")) {
      db.exec("ALTER TABLE apiKeys ADD COLUMN dailyTokenLimit INTEGER");
    }
    if (!hasColumn(db, "apiKeys", "dailyResetTime")) {
      db.exec("ALTER TABLE apiKeys ADD COLUMN dailyResetTime TEXT NOT NULL DEFAULT '00:00'");
    }
    if (!hasColumn(db, "apiKeys", "hourlyTokenLimit")) {
      db.exec("ALTER TABLE apiKeys ADD COLUMN hourlyTokenLimit INTEGER");
    }
    if (!hasColumn(db, "apiKeys", "hourlyResetMinute")) {
      db.exec("ALTER TABLE apiKeys ADD COLUMN hourlyResetMinute INTEGER NOT NULL DEFAULT 0");
    }
    db.exec("CREATE INDEX IF NOT EXISTS idx_uh_api_key_ts ON usageHistory(apiKey, timestamp)");
  },
};

export default migration;
