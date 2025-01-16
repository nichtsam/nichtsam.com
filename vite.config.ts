import { reactRouter } from '@react-router/dev/vite'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import { defineConfig } from 'vite'
import { envOnlyMacros } from 'vite-env-only'

export default defineConfig({
	build: {
		cssMinify: process.env.NODE_ENV === 'production',

		sourcemap: true,
	},

	plugins: [
		envOnlyMacros(),
		reactRouter(),

		process.env.SENTRY_AUTH_TOKEN
			? sentryVitePlugin({
					disable: process.env.NODE_ENV !== 'production',
					authToken: process.env.SENTRY_AUTH_TOKEN,
					org: process.env.SENTRY_ORG,
					project: process.env.SENTRY_PROJECT,

					release: {
						name: process.env.COMMIT_SHA,
					},
					sourcemaps: {
						filesToDeleteAfterUpload: ['./build/**/*.map'],
					},
				})
			: null,
	],
})
