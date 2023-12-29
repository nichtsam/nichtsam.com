import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { singleton } from "./singleton.server.ts";
import * as schema from "@/../database/schema.ts";

export const db = singleton("db", () => {
  const sqlite = new Database("./database/sqlite.db");
  return drizzle(sqlite, { schema });
});
