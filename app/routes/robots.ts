import { siteUrl } from '#app/config/site.ts'

export function loader() {
	return new Response(
		`User-agent: *\nAllow: /\nSitemap: ${siteUrl('/sitemap.xml')}\n`,
		{ headers: { 'Content-Type': 'text/plain' } },
	)
}
