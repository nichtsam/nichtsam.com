import contentCollections from '@content-collections/remix-vite'
import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { iconsSpritesheet } from 'vite-plugin-icons-spritesheet'

export default defineConfig({
	build: {
		cssMinify: process.env.NODE_ENV === 'production',
	},

	ssr: {
		noExternal: ['posthog-js', '@posthog/react'],
	},

	plugins: [
		contentCollections(),
		tailwindcss(),
		reactRouter(),

		iconsSpritesheet({
			withTypes: true,
			inputDir: './other/svg-icons',
			outputDir: './app/components/ui/icons',
			fileName: 'sprite.svg',
			iconNameTransformer: (iconName) => iconName,
		}),
	],
})
