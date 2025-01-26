import { relations, sql } from 'drizzle-orm'
import {
	blob,
	index,
	integer,
	sqliteTable,
	text,
	unique,
} from 'drizzle-orm/sqlite-core'
import { createInsertSchema } from 'drizzle-zod'
import { nanoid as createId } from 'nanoid'

export type User = typeof userTable.$inferSelect
export const userTable = sqliteTable('user', {
	id: text('id').primaryKey().$default(createId).notNull(),

	email: text('email').unique().notNull(),
	username: text('username').unique().notNull(),
	display_name: text('display_name').notNull(),

	created_at: integer('created_at', { mode: 'timestamp_ms' })
		.default(sql`(unixepoch('subsec') * 1000)`)
		.notNull(),
})

export const userImageTable = sqliteTable('user_image', {
	id: text('id').primaryKey().$default(createId).notNull(),

	user_id: text('user_id')
		.references(() => userTable.id, { onDelete: 'cascade' })
		.notNull(),
	content_type: text('content_type').notNull(),
	blob: blob('blob', { mode: 'buffer' }).notNull(),

	created_at: integer('created_at', { mode: 'timestamp_ms' })
		.default(sql`(unixepoch('subsec') * 1000)`)
		.notNull(),
})

export const connectionTable = sqliteTable(
	'connection',
	{
		id: text('id').primaryKey().$default(createId).notNull(),

		provider_name: text('provider_name').notNull(),
		provider_id: text('provider_id').notNull(),
		user_id: text('user_id')
			.references(() => userTable.id, { onDelete: 'cascade' })
			.notNull(),

		created_at: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(unixepoch('subsec') * 1000)`)
			.notNull(),
	},
	(table) => [unique().on(table.provider_name, table.provider_id)],
)

export const sessionTable = sqliteTable(
	'session',
	{
		id: text('id').primaryKey().$default(createId).notNull(),

		expiration_at: integer('expiration_at', {
			mode: 'timestamp_ms',
		}).notNull(),

		user_id: text('user_id')
			.references(() => userTable.id, { onDelete: 'cascade' })
			.notNull(),

		created_at: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(unixepoch('subsec') * 1000)`)
			.notNull(),
	},
	(table) => [index('user_id_idx').on(table.user_id)],
)

export const userSchema = createInsertSchema(userTable)
export const imageSchema = createInsertSchema(userImageTable)
export const connectionSchema = createInsertSchema(connectionTable)
export const sessionSchema = createInsertSchema(sessionTable)

export const userRelations = relations(userTable, ({ one, many }) => ({
	connections: many(connectionTable, { relationName: 'user_connections' }),
	session: one(sessionTable),
	image: one(userImageTable),
}))

export const imageRelations = relations(userImageTable, ({ one }) => ({
	user: one(userTable, {
		fields: [userImageTable.user_id],
		references: [userTable.id],
		relationName: 'user_image',
	}),
}))

export const connectionRelations = relations(connectionTable, ({ one }) => ({
	user: one(userTable, {
		fields: [connectionTable.user_id],
		references: [userTable.id],
		relationName: 'user_connections',
	}),
}))

export const sessionRelations = relations(sessionTable, ({ one }) => ({
	user: one(userTable, {
		fields: [sessionTable.user_id],
		references: [userTable.id],
		relationName: 'user_session',
	}),
}))
