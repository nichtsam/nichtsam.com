import { readFile } from 'node:fs/promises'
import path from 'node:path'
import parseMatter from 'gray-matter'
import { glob } from 'tinyglobby'
import { z, type ZodObject, type ZodRawShape } from 'zod'
import { cachified, shortLivedCache } from '../cache.server'
import { type ServerTiming } from '../timings.server'
import { type Collection, type Meta } from './model'

async function retrieve<
	TName extends string,
	TCollectionName extends string,
	TSchema extends ZodObject<ZodRawShape>,
	TResult,
>(
	collection: Collection<TCollectionName, TSchema, TResult>,
	name: TName,
): Promise<TResult | null> {
	const entries = await glob(collection.includes, {
		cwd: collection.directory,
		onlyFiles: true,
		ignore: collection.excludes,
	})

	let entry = entries.find((e) => new RegExp(`${name}\\.mdx?$`).test(e))
	if (!entry) {
		entry = entries.find((e) => new RegExp(`${name}/index\.mdx?$`).test(e))
		if (!entry) {
			return null
		}
	}
	return completeEntry(entry, collection)
}

async function retrieveAll<
	TCollectionName extends string,
	TSchema extends ZodObject<ZodRawShape>,
	TResult,
>(
	collection: Collection<TCollectionName, TSchema, TResult>,
): Promise<TResult[]> {
	const entries = await glob(collection.includes, {
		cwd: collection.directory,
		onlyFiles: true,
		ignore: collection.excludes,
	})

	const all: TResult[] = []

	await Promise.all(
		entries.map(async (entry) => {
			try {
				all.push(await completeEntry(entry, collection))
			} catch (err) {
				if (err instanceof z.ZodError) {
					console.error(
						`Error: skipping blog post '${entry}', invalid frontMatter:`,
						err.flatten().fieldErrors,
					)
				} else if (err instanceof Error) {
					console.error(`Error: skipping blog post '${entry}',`, err.message)
				} else {
					console.error(`Error: skipping blog post '${entry}',`, err)
				}
			}
		}),
	)

	return all
}

async function completeEntry<
	TName extends string,
	TSchema extends ZodObject<ZodRawShape>,
	TResult,
>(entry: string, collection: Collection<TName, TSchema, TResult>) {
	const parsedPath = path.parse(entry)

	const meta = {
		contentDir: collection.directory,
		dir: parsedPath.dir || '.',
		base: parsedPath.base,
		ext: parsedPath.ext,
		name: parsedPath.name,
		slug: parsedPath.dir ? parsedPath.dir : parsedPath.name,
	} satisfies Omit<Meta, 'content'>

	const filepath = path.resolve(collection.directory, meta.dir, meta.base)
	const file = await readFile(filepath, 'utf-8')
	const { content, data } = parseMatter(file)
	const matter = collection.schema.parse(data)

	return collection.transform({
		matter,
		meta: {
			...meta,
			content,
		},
	})
}

function cachedRetrieve<
	TName extends string,
	TCollectionName extends string,
	TSchema extends ZodObject<ZodRawShape>,
	TResult,
>(
	collection: Collection<TCollectionName, TSchema, TResult>,
	name: TName,
	timing?: ServerTiming,
): Promise<TResult | null> {
	const key = `content:${collection.name}:${name}`
	return cachified({
		key,
		cache: shortLivedCache,
		swr: Infinity,
		timing,
		getFreshValue: () => retrieve(collection, name),
	})
}

function cachedRetrieveAll<
	TCollectionName extends string,
	TSchema extends ZodObject<ZodRawShape>,
	TResult,
>(
	collection: Collection<TCollectionName, TSchema, TResult>,
	timing?: ServerTiming,
): Promise<TResult[]> {
	const key = `content:${collection.name}:all`
	return cachified({
		key,
		cache: shortLivedCache,
		swr: Infinity,
		timing,
		getFreshValue: () => retrieveAll(collection),
	})
}

export { cachedRetrieve as retrieve, cachedRetrieveAll as retrieveAll }
