import { siteUrl } from '#src/config/site.ts'
import { articlePath, getPublishedArticles } from '#src/utils/articles.ts'

export async function GET() {
	const paths = [
		'/',
		'/articles',
		...(await getPublishedArticles()).map((article) => articlePath(article.id)),
	]

	const urls = paths
		.map((path) => `<url><loc>${siteUrl(path)}</loc></url>`)
		.join('')

	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
	)
}
