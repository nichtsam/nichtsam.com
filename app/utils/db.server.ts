import { drizzle } from "drizzle-orm/libsql";
import { singleton } from "./singleton.server.ts";
import * as schema from "drizzle/schema.ts";
import { env } from "./env.server.ts";
import { createClient } from "@libsql/client";

export const db = singleton("db", () => {
  const client = createClient({
    url: env.TURSO_DB_URL,
    authToken: env.TURSO_DB_AUTH_TOKEN,
  });
  return drizzle(client, { schema });
});
