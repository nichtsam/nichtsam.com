import path from 'node:path'
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
		// Imported here so that loading this config doesn't validate the env
		const { addNotFoundPage } = await import('./other/not-found-page.ts')
		const { addContentSecurityPolicy } = await import('./other/csp.ts')

		// First, so that the not found page gets a CSP too
		await addNotFoundPage(reactRouterConfig)
		await addContentSecurityPolicy(
			path.join(reactRouterConfig.buildDirectory, 'client'),
		)

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
