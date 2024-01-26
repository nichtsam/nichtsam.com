import "dotenv/config.js";
import { mkdirSync } from "fs";
import path from "path";
import { z } from "zod";

import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import Database from "better-sqlite3";

const env = z
  .object({
    DATABASE_PATH: z.string(),
  })
  .parse(process.env);

mkdirSync(path.dirname(env.DATABASE_PATH), { recursive: true });

const betterSqlite = new Database(env.DATABASE_PATH);
const db = drizzle(betterSqlite);

console.log("Running database migrations...");
console.time("🤖 Migrated");
migrate(db, { migrationsFolder: "./drizzle" });
console.timeEnd("🤖 Migrated");

betterSqlite.close();
