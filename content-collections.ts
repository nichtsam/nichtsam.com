import { defineCollection, defineConfig } from '@content-collections/core'
import { compileMDX } from '@content-collections/mdx'
import rehypeShiki, { type RehypeShikiOptions } from '@shikijs/rehype'
import dayjs from 'dayjs'
import readingTime from 'reading-time'
import rehypeAutolinkHeadings, { type Options } from 'rehype-autolink-headings'
import rehypeSlug from 'rehype-slug'
import z from 'zod'

const articles = defineCollection({
	name: 'articles',
	directory: 'content/articles',
	include: '**/*.{md,mdx}',
	exclude: '_*',
	schema: z.object({
		draft: z.boolean().default(false),
		title: z.string(),
		description: z.string(),
		publishedDate: z.iso
			.date()
			.transform((date) => dayjs(date).format('MMM YYYY')),
		keywords: z.array(z.string()),

		content: z.string(),
	}),
	transform: async (doc, context) => {
		const mdx = await compileMDX(context, doc, {
			rehypePlugins: [
				[
					rehypeShiki,
					{
						themes: {
							light: 'catppuccin-latte',
							dark: 'tokyo-night',
						},
					} satisfies RehypeShikiOptions,
				],
				rehypeSlug,
				[
					rehypeAutolinkHeadings,
					{
						behavior: 'wrap',
						test: (node) => node.tagName !== 'h1',
					} satisfies Options,
				],
			],
		})
		return {
			...doc,
			mdx,
			readingTime: readingTime(doc.content).text,
			slug: doc._meta.path.replace(/\.mdx?$/, ''),
		}
	},
})

export default defineConfig({
	content: [articles],
})
