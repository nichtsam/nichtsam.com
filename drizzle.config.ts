import "dotenv/config";
import type { Config } from "drizzle-kit";
import { z } from "zod";

const env = z
  .object({
    TURSO_DB_URL: z.string().url(),
    TURSO_DB_AUTH_TOKEN: z.string(),
  })
  .parse(process.env);

export default {
  dialect: "sqlite",
  driver: "turso",
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: env.TURSO_DB_URL,
    authToken: env.TURSO_DB_AUTH_TOKEN,
  },
} satisfies Config;
