import "dotenv/config";
import type { Config } from "drizzle-kit";
export default {
  driver: "better-sqlite",
  schema: "./database/schema.ts",
  out: "./database/drizzle",
  dbCredentials: {
    url: "./database/sqlite.db",
  },
} satisfies Config;
