import { satteri, satteriHeadingIdsPlugin } from '@astrojs/markdown-satteri'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, fontProviders } from 'astro/config'

export default defineConfig({
	site: 'https://nichtsam.com',
	// Matches the canonical URLs and the Worker's `drop-trailing-slash`
	trailingSlash: 'never',

	markdown: {
		shikiConfig: {
			themes: { light: 'vitesse-light', dark: 'vitesse-dark' },
			// Leaves the colors in variables for `article.css` to pick by the system
			// theme
			defaultColor: false,
		},
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

	fonts: [
		{
			provider: fontProviders.local(),
			name: 'Newsreader',
			cssVariable: '--font-newsreader',
			fallbacks: ['serif'],
			options: {
				// The opsz files carry the optical size axis on top of weight, which
				// thins the strokes out at display sizes
				variants: [
					{
						src: [
							'@fontsource-variable/newsreader/files/newsreader-latin-opsz-normal.woff2',
						],
						weight: '200 800',
						style: 'normal',
					},
					{
						src: [
							'@fontsource-variable/newsreader/files/newsreader-latin-opsz-italic.woff2',
						],
						weight: '200 800',
						style: 'italic',
					},
				],
			},
		},
		{
			provider: fontProviders.local(),
			name: 'IBM Plex Mono',
			cssVariable: '--font-plex-mono',
			fallbacks: ['monospace'],
			options: {
				variants: [
					{
						src: [
							'@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2',
						],
						weight: 400,
						style: 'normal',
					},
					{
						src: [
							'@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2',
						],
						weight: 500,
						style: 'normal',
					},
				],
			},
		},
	],

	vite: {
		plugins: [tailwindcss()],
	},
})
