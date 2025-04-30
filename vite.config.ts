import { reactRouter } from '@react-router/dev/vite'
import {
	sentryReactRouter,
	type SentryReactRouterBuildOptions,
} from '@sentry/react-router'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { envOnlyMacros } from 'vite-env-only'

export default defineConfig((config) => ({
	build: {
		cssMinify: process.env.NODE_ENV === 'production',

		sourcemap: true,
	},

	sentryConfig,
	plugins: [
		envOnlyMacros(),
		tailwindcss(),
		reactRouter(),

		process.env.SENTRY_AUTH_TOKEN && process.env.NODE_ENV === 'production'
			? sentryReactRouter(sentryConfig, config)
			: null,
	],
}))

const sentryConfig: SentryReactRouterBuildOptions = {
	authToken: process.env.SENTRY_AUTH_TOKEN,
	org: process.env.SENTRY_ORG,
	project: process.env.SENTRY_PROJECT,

	release: {
		name: process.env.COMMIT_SHA,
	},

	unstable_sentryVitePluginOptions: {
		sourcemaps: {
			filesToDeleteAfterUpload: ['./build/**/*.map'],
		},
	},
}
