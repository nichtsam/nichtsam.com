import { type APIContext } from 'astro'
import { articlePath, getArticles } from '#src/utils/articles.ts'

export async function GET({ site }: APIContext) {
	const paths = [
		'/',
		'/articles',
		...(await getArticles()).map((article) => articlePath(article.id)),
	]

	const urls = paths
		.map((path) => `<url><loc>${new URL(path, site).href}</loc></url>`)
		.join('')

	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
	)
}
