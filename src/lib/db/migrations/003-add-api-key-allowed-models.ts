function hasColumn(db, tableName, columnName) {
  return db
    .all(`PRAGMA table_info(${tableName})`)
    .some((column) => column.name === columnName);
}

const migration = {
  version: 3,
  name: "add-api-key-allowed-models",
  up(db) {
    if (!hasColumn(db, "apiKeys", "allowedModels")) {
      db.exec("ALTER TABLE apiKeys ADD COLUMN allowedModels TEXT");
    }
  },
};

export default migration;
