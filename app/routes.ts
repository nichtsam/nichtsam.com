import { type RouteConfig, index, route } from '@react-router/dev/routes'

export default [
	index('routes/home.tsx'),
	route('articles', 'routes/articles.tsx'),
	route('articles/:slug', 'routes/article.tsx'),
	route('robots.txt', 'routes/robots.ts'),
	route('sitemap.xml', 'routes/sitemap.ts'),
	route('*', 'routes/not-found.tsx'),
] satisfies RouteConfig
