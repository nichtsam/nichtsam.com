import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { singleton } from "./singleton.server.ts";
import * as schema from "drizzle/schema.ts";
import { env } from "./env.server.ts";

export const db = singleton("db", () => {
  const sqlite = new Database(env.DATABASE_PATH);
  return drizzle(sqlite, { schema });
});
