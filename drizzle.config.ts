import "dotenv/config";
import type { Config } from "drizzle-kit";
import { z } from "zod";

const env = z
  .object({
    DATABASE_PATH: z.string(),
  })
  .parse(process.env);

export default {
  driver: "better-sqlite",
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: env.DATABASE_PATH,
  },
} satisfies Config;
