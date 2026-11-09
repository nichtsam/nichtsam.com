import { getOrigin } from '#app/utils/misc.ts'
import { allArticles } from '#content-collections'
import { type Route } from './+types/sitemap'

export function loader({ request }: Route.LoaderArgs) {
	const origin = getOrigin(request)
	const paths = [
		'',
		'/articles',
		...allArticles
			.filter((article) => !article.draft)
			.map((article) => `/articles/${article.slug}`),
	]

	const urls = paths
		.map((path) => `<url><loc>${origin}${path}</loc></url>`)
		.join('')

	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
		{ headers: { 'Content-Type': 'application/xml' } },
	)
}
