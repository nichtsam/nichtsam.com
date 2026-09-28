import { redirect } from 'remix/response/redirect'
import { createController } from 'remix/router'

import { listArticles } from '../content/articles.ts'
import { listProjects } from '../content/projects.ts'
import { absoluteUrl } from '../content/site.ts'
import { assets } from '../assets.ts'
import { serializeThemeCookie, ThemeKey } from '../middleware/theme.ts'
import { routes } from '../routes.ts'
import { AboutPage } from './about-page.tsx'
import { pageHeaders } from './headers.ts'
import { HomePage } from './home-page.tsx'
import { NotFoundPage } from './not-found-page.tsx'

/** Only same-site paths, so the theme form can't be used to redirect elsewhere. */
function safeReturnPath(value: FormDataEntryValue | null) {
	if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return '/'
	if (value.includes('\\')) return '/'
	return value
}

export default createController(routes, {
	actions: {
		async assets(context) {
			return (await assets.fetch(context.request)) ?? new Response('Not Found', { status: 404 })
		},
		async home(context) {
			let articles = await listArticles()
			return context.render(
				<HomePage articles={articles} projects={listProjects()} theme={context.get(ThemeKey)} />,
				{ headers: pageHeaders },
			)
		},
		about(context) {
			return context.render(<AboutPage />, { headers: pageHeaders })
		},
		async theme(context) {
			let form = await context.request.formData().catch(() => new FormData())
			let value = form.get('theme')
			if (value !== 'light' && value !== 'dark') {
				return new Response('Unknown theme', { status: 400 })
			}
			return redirect(safeReturnPath(form.get('returnTo')), {
				status: 303,
				headers: {
					'Set-Cookie': serializeThemeCookie(value, context.url.protocol === 'https:'),
				},
			})
		},
		async sitemap() {
			let articles = await listArticles()
			let paths = [
				routes.home.href(),
				routes.about.href(),
				routes.projects.index.href(),
				...listProjects().map((project) => routes.projects.show.href({ slug: project.slug })),
				routes.articles.index.href(),
				...articles.map((article) => routes.articles.show.href({ slug: article.slug })),
			]
			let body = [
				'<?xml version="1.0" encoding="UTF-8"?>',
				'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
				...paths.map((path) => `  <url><loc>${absoluteUrl(path)}</loc></url>`),
				'</urlset>',
			].join('\n')
			return new Response(body, {
				headers: {
					'Content-Type': 'application/xml; charset=utf-8',
					'Cache-Control': 'public, max-age=3600',
				},
			})
		},
		robots() {
			let body = [
				'User-agent: *',
				'Allow: /',
				'',
				`Sitemap: ${absoluteUrl(routes.sitemap.href())}`,
			].join('\n')
			return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
		},
		notFound(context) {
			return context.render(<NotFoundPage pathname={context.url.pathname} />, { status: 404 })
		},
	},
})
