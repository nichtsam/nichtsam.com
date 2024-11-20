import { vitePlugin as remix } from '@remix-run/dev'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import { flatRoutes } from 'remix-flat-routes'
import { defineConfig } from 'vite'

export default defineConfig({
	build: {
		cssMinify: process.env.NODE_ENV === 'production',

		sourcemap: true,
	},

	plugins: [
		remix({
			serverModuleFormat: 'esm',

			ignoredRouteFiles: ['**/*'],
			routes: async (defineRoutes) => {
				return flatRoutes('routes', defineRoutes, {
					ignoredRouteFiles: ['**/*.test.{js,jsx,ts,tsx}'],
				})
			},
		}),

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
