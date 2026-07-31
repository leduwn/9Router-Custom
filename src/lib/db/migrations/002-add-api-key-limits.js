function hasColumn(db, tableName, columnName) {
  return db
    .all(`PRAGMA table_info(${tableName})`)
    .some((column) => column.name === columnName);
}

const migration = {
  version: 2,
  name: "add-api-key-limits",
  up(db) {
    if (!hasColumn(db, "apiKeys", "tokenLimit")) {
      db.exec("ALTER TABLE apiKeys ADD COLUMN tokenLimit INTEGER");
    }
    if (!hasColumn(db, "apiKeys", "usedTokens")) {
      db.exec("ALTER TABLE apiKeys ADD COLUMN usedTokens INTEGER NOT NULL DEFAULT 0");
    }
  },
};

export default migration;
