import dayjs from 'dayjs'
import readingTime from 'reading-time'
import { z } from 'zod'
import { defineCollection } from './model'

export const posts = defineCollection({
	name: 'posts',
	directory: 'content/blog',
	includes: '**/*.{md,mdx}',
	excludes: '_*',
	schema: z.object({
		title: z.string(),
		description: z.string(),
		publishedDate: z.date().transform((date) => dayjs(date).format('MMM YYYY')),
		keywords: z.array(z.string()),
	}),
	transform: (doc) => ({
		...doc,
		readingTime: readingTime(doc.meta.content).text,
	}),
})

export default {
	collections: [posts],
}
