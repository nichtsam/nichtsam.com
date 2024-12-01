import { remember } from '@epic-web/remember'
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from '#drizzle/schema.ts'
import { env } from './env.server.ts'

export const db = remember('db', () => {
	const client = createClient({
		url: env.TURSO_DB_URL,
		authToken: env.TURSO_DB_AUTH_TOKEN,
	})
	return drizzle(client, { schema })
})
