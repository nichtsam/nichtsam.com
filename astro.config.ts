import { satteri, satteriHeadingIdsPlugin } from '@astrojs/markdown-satteri'
import mdx from '@astrojs/mdx'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'

export default defineConfig({
	site: 'https://nichtsam.com',
	// Matches the canonical URLs and the Worker's `drop-trailing-slash`
	trailingSlash: 'never',

	markdown: {
		shikiConfig: { theme: 'catppuccin-latte' },
		processor: satteri({
			// Articles keep the quotes they were written with
			features: { smartPunctuation: false },
			hastPlugins: [
				// The links below point at these ids, so they have to exist first
				satteriHeadingIdsPlugin(),
				{
					name: 'autolink-headings',
					element: {
						filter: ['h2', 'h3', 'h4', 'h5', 'h6'],
						visit(node, ctx) {
							const id = node.properties.id
							if (typeof id !== 'string') return

							ctx.setField(node, 'children', [
								{
									type: 'element',
									tagName: 'a',
									properties: { href: `#${id}` },
									children: node.children,
								},
							])
						},
					},
				},
			],
		}),
	},

	integrations: [mdx()],

	vite: {
		plugins: [tailwindcss()],
	},
})
