import { glob } from 'astro/loaders'
import { z } from 'astro/zod'
import { defineCollection } from 'astro:content'

const articles = defineCollection({
	loader: glob({
		base: 'content/articles',
		// Files starting with `_` are templates, test pages and unfinished articles
		pattern: ['**/*.{md,mdx}', '!**/_*'],
	}),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		publishedDate: z.coerce.date(),
	}),
})

export const collections = { articles }
