import { type ZodRawShape, type ZodObject, type z } from 'zod'

export function defineCollection<
	TName extends string,
	TSchema extends ZodObject<ZodRawShape>,
	TResult,
>(collection: Collection<TName, TSchema, TResult>) {
	return collection
}

export type Meta = {
	/** Directory of the content type */
	contentDir: string
	/** Directory of the file */
	dir: string
	/** File name with extension */
	base: string
	/** File extension */
	ext: string
	/** File name without extension */
	name: string
	/** Content of the file */
	content: string
	/** Slug identifier of the content */
	slug: string
}

export type Collection<
	TName extends string,
	TSchema extends ZodObject<ZodRawShape>,
	TResult,
> = {
	name: TName
	directory: string
	includes: string | string[]
	excludes?: string | string[]
	schema: TSchema
	transform: (data: { matter: z.infer<TSchema>; meta: Meta }) => TResult
}
