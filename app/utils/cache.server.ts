import {
	cachified as baseCachified,
	totalTtl,
	type CacheEntry,
	type CachifiedOptions,
	type Cache,
	type CreateReporter,
	mergeReporters,
	verboseReporter,
} from '@epic-web/cachified'
import { remember } from '@epic-web/remember'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/libsql'
import { LRUCache } from 'lru-cache'
import { z } from 'zod'
import * as cacheDbSchema from '#drizzle/cache.ts'
import { env } from './env.server'
import { type ServerTiming } from './timings.server'

export { longLivedCache, shortLivedCache, cachified }

const cacheEntrySchema = z.object({
	metadata: z.object({
		createdTime: z.number(),
		ttl: z.number().nullable().optional(),
		swr: z.number().nullable().optional(),
	}),
	value: z.custom<{}>((val) => !!val),
})

const cacheDb = remember('cacheDb', () => {
	const db = drizzle({
		schema: cacheDbSchema,
		connection: {
			url: env.TURSO_DB_URL,
			authToken: env.TURSO_DB_AUTH_TOKEN,
		},
	})

	return db
})

const cacheMemory = remember(
	'cacheMemory',
	() => new LRUCache<string, CacheEntry>({ max: 1000 }),
)

const longLivedCache: Cache = {
	async get(key) {
		const raw = await cacheDb.query.cacheTable.findFirst({
			where: (cache) => eq(cache.key, key),
		})

		if (!raw) {
			return null
		}

		const parsed = cacheEntrySchema.safeParse({
			metadata: JSON.parse(raw.metadata),
			value: JSON.parse(raw.value),
		})

		if (!parsed.success) {
			return null
		}

		return parsed.data
	},
	set(key, cacheEnrtry) {
		const { metadata, value } = {
			metadata: JSON.stringify(cacheEnrtry.metadata),
			value: JSON.stringify(cacheEnrtry.value),
		}
		void cacheDb
			.insert(cacheDbSchema.cacheTable)
			.values({
				key,
				metadata,
				value,
			})
			.onConflictDoUpdate({
				target: cacheDbSchema.cacheTable.key,
				set: {
					metadata,
					value,
				},
			})
			.then()
	},
	delete(key) {
		void cacheDb
			.delete(cacheDbSchema.cacheTable)
			.where(eq(cacheDbSchema.cacheTable.key, key))
	},
}

const shortLivedCache: Cache = {
	set(key, value) {
		const ttl = totalTtl(value?.metadata)
		return cacheMemory.set(key, value, {
			ttl: ttl === Infinity ? undefined : ttl,
			start: value?.metadata?.createdTime,
		})
	},
	get(key) {
		return cacheMemory.get(key)
	},
	delete(key) {
		return cacheMemory.delete(key)
	},
}

function cachified<Value>(
	{ timing, ...options }: CachifiedOptions<Value> & { timing?: ServerTiming },
	reporter: CreateReporter<Value> = verboseReporter<Value>(),
): Promise<Value> {
	return baseCachified(
		options,
		mergeReporters(reporter, timing ? timingReporter(timing) : null),
	)
}

function timingReporter<Value>(timing: ServerTiming): CreateReporter<Value> {
	return ({ key }) => {
		timing.time(`cache:${key}`, `${key} cache retrieval`)
		return (event) => {
			switch (event.name) {
				case 'getFreshValueStart':
					timing.time(
						`getFreshValue:${key}`,
						`request forced to wait for a fresh ${key} value`,
					)
					break
				case 'getFreshValueSuccess':
					timing.timeEnd(`getFreshValue:${key}`)
					break
				case 'done':
					timing.timeEnd(`cache:${key}`)
					break
			}
		}
	}
}
