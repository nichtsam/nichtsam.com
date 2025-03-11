import { type Config } from '@react-router/dev/config'
import { sentryOnBuildEnd } from '@sentry/react-router'

export default {
	ssr: true,

	future: {
		unstable_optimizeDeps: true,
	},

	buildEnd: async ({ viteConfig, reactRouterConfig, buildManifest }) => {
		if (
			process.env.SENTRY_AUTH_TOKEN &&
			process.env.NODE_ENV === 'production'
		) {
			await sentryOnBuildEnd({
				viteConfig,
				reactRouterConfig,
				buildManifest,
			})
		}
	},
} satisfies Config
