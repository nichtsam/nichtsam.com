import { type Config } from '@react-router/dev/config'
import { sentryOnBuildEnd } from '@sentry/react-router'

export default {
	ssr: true,

	// Static hosting has no server to answer lazy route discovery requests
	routeDiscovery: { mode: 'initial' },

	prerender: async ({ getStaticPaths }) => {
		const { allArticles } = await import('#content-collections')
		const { articlePath } = await import('#app/utils/content/articles.ts')

		return [
			...getStaticPaths(),
			// Drafts stay reachable by URL, they are only left out of listings
			...allArticles.map((article) => articlePath(article.slug)),
		]
	},

	future: {},

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
