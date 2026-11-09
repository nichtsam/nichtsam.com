import { getOrigin } from '#app/utils/misc.ts'
import { type Route } from './+types/robots'

export function loader({ request }: Route.LoaderArgs) {
	return new Response(
		`User-agent: *\nAllow: /\nSitemap: ${getOrigin(request)}/sitemap.xml\n`,
		{ headers: { 'Content-Type': 'text/plain' } },
	)
}
