import { sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const cacheTable = sqliteTable('cache', {
	key: text('key').primaryKey(),
	metadata: text('metadata').notNull(),
	value: text('value').notNull(),
})
