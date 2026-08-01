// Initial schema bootstrap. For fresh DB this creates all tables/indexes.
// For existing DB at version 0 (legacy unstamped), it's idempotent (IF NOT EXISTS).
import { TABLES, buildCreateTableSql } from "../schema";

export default {
  version: 1,
  name: "initial",
  up(db) {
    for (const [name, defValue] of Object.entries(TABLES)) {
      const def: any = defValue;
      db.exec(buildCreateTableSql(name, def));
      for (const idx of def.indexes || []) db.exec(idx);
    }
  },
};
