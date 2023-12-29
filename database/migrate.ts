import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import Database from "better-sqlite3";

const betterSqlite = new Database("./database/sqlite.db");
const db = drizzle(betterSqlite);

migrate(db, { migrationsFolder: "./database/drizzle" });

betterSqlite.close();
