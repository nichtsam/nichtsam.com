import 'dotenv/config.js'
import { mkdirSync } from 'fs'
import { dirname } from 'path'
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { migrate } from 'drizzle-orm/libsql/migrator'

import { z } from 'zod'

const envSchema = z.object({
	TURSO_DB_URL: z.string().url(),
	TURSO_DB_AUTH_TOKEN: z.string(),
})

const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
	console.error(
		'❌ Invalid environment variables:',
		parsedEnv.error.flatten().fieldErrors,
	)

	throw new Error('Invalid environment variables')
}

const env = parsedEnv.data

if (env.TURSO_DB_URL.startsWith('file:')) {
	mkdirSync(dirname(env.TURSO_DB_URL.slice(5)), { recursive: true })
}

const client = createClient({
	url: env.TURSO_DB_URL,
	authToken: env.TURSO_DB_AUTH_TOKEN,
})
const db = drizzle(client)

console.log('Running database migrations...')
console.time('🤖 Migrated')
await migrate(db, { migrationsFolder: './drizzle' })
console.timeEnd('🤖 Migrated')

client.close()
