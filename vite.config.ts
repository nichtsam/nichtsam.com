import { vitePlugin as remix } from '@remix-run/dev'
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
		remix({
			future: {
				unstable_optimizeDeps: true,
				v3_routeConfig: true,
				v3_fetcherPersist: true,
				v3_relativeSplatPath: true,
				v3_lazyRouteDiscovery: true,
				v3_throwAbortReason: true,
			},
			serverModuleFormat: 'esm',
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
