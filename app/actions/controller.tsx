import { createController } from 'remix/router'

import { listArticles } from '../content/articles.ts'
import { assets } from '../assets.ts'
import { routes } from '../routes.ts'
import { site } from '../ui/site.ts'
import { HomePage } from './home-page.tsx'
import { NotFoundPage } from './not-found-page.tsx'

const pageCache = { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=86400' }

export default createController(routes, {
	actions: {
		async assets(context) {
			return (await assets.fetch(context.request)) ?? new Response('Not Found', { status: 404 })
		},
		async home(context) {
			let articles = await listArticles()
			return context.render(<HomePage articles={articles} />, { headers: pageCache })
		},
		async sitemap() {
			let articles = await listArticles()
			let urls = [
				routes.home.href(),
				routes.articles.index.href(),
				...articles.map((article) => routes.articles.show.href({ slug: article.slug })),
			]
			let body = [
				'<?xml version="1.0" encoding="UTF-8"?>',
				'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
				...urls.map((path) => `  <url><loc>${new URL(path, site.url).href}</loc></url>`),
				'</urlset>',
			].join('\n')
			return new Response(body, {
				headers: { 'Content-Type': 'application/xml; charset=utf-8', ...pageCache },
			})
		},
		robots() {
			let body = [
				'User-agent: *',
				'Allow: /',
				'',
				`Sitemap: ${new URL(routes.sitemap.href(), site.url).href}`,
			].join('\n')
			return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
		},
		notFound(context) {
			return context.render(<NotFoundPage pathname={context.url.pathname} />, { status: 404 })
		},
	},
})
