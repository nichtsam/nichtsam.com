import { glob } from 'astro/loaders'
import { z } from 'astro/zod'
import { defineCollection } from 'astro:content'

const articles = defineCollection({
	loader: glob({
		base: 'content/articles',
		// Files starting with `_` are templates and test pages
		pattern: ['**/*.{md,mdx}', '!**/_*'],
	}),
	schema: z.object({
		draft: z.boolean().default(false),
		title: z.string(),
		description: z.string(),
		publishedDate: z.coerce.date(),
		keywords: z.array(z.string()),
	}),
})

export const collections = { articles }
