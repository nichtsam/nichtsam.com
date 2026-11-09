import { siteUrl } from '#app/config/site.ts'
import { allArticles } from '#content-collections'

export function loader() {
	const paths = [
		'/',
		'/articles',
		...allArticles
			.filter((article) => !article.draft)
			.map((article) => `/articles/${article.slug}`),
	]

	const urls = paths
		.map((path) => `<url><loc>${siteUrl(path)}</loc></url>`)
		.join('')

	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
		{ headers: { 'Content-Type': 'application/xml' } },
	)
}
