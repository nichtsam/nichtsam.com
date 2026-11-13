import { glob } from 'astro/loaders'
import { z } from 'astro/zod'
import { defineCollection } from 'astro:content'

const link = z.object({
	title: z.string(),
	href: z.url(),
})

const articles = defineCollection({
	loader: glob({
		base: 'content/articles',
		// Files starting with `_` are templates and unfinished articles
		pattern: ['**/*.md', '!**/_*'],
	}),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		publishedDate: z.coerce.date(),
	}),
})

const projects = defineCollection({
	loader: glob({
		base: 'content/projects',
		pattern: ['**/*.md', '!**/_*'],
	}),
	schema: z.object({
		name: z.string(),
		startedYear: z.number().int(),
		// Projects without one are still going
		endedYear: z.number().int().optional(),
		role: z.string(),
		stack: z.array(z.string()),
		links: z.array(link),
		stories: z.array(
			z.object({
				// Stories without one haven't happened yet
				date: z.coerce.date().optional(),
				title: z.string(),
				body: z.string(),
				links: z.array(link).default([]),
				// Starts the story expanded
				open: z.boolean().default(false),
			}),
		),
	}),
})

export const collections = { articles, projects }
