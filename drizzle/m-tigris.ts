import 'dotenv/config.js'
import { mkdirSync } from 'fs'
import { dirname } from 'path'
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import mime from 'mime'
import { z } from 'zod'
import { uploadUserImage } from '#app/utils/storage.server.ts'
import * as schema from '#drizzle/schema.ts'
import { where } from 'ramda'
import { eq } from 'drizzle-orm'

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

const db = drizzle(client, { schema })

async function fetchUserImages() {
	const result = db.query.userImageTable.findMany()
	return result
}

async function main() {
	const images = await fetchUserImages()

	const promises = images.map(
		async ({ user_id, blob, content_type, object_key }) => {
			if (object_key != 'migration_needed') {
				console.log(`migration already done, skipping for userId: ${user_id}`)
				return
			}

			const extension = mime.getExtension(content_type)
			const filename = extension
				? `downloaded-file.${extension}`
				: `downloaded-file`
			const file = new File([blob], filename, { type: content_type })
			const objectKey = await uploadUserImage(user_id, file)
			await db
				.update(schema.userImageTable)
				.set({ object_key: objectKey })
				.where(eq(schema.userImageTable.user_id, user_id))
		},
	)

	await Promise.all(promises)
}

main().catch(console.error)
