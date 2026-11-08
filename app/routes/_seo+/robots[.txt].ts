import { generateRobotsTxt } from '@nasa-gcn/remix-seo'
import { getOrigin } from '#app/utils/misc.ts'
import { type Route } from './+types/robots[.txt]'

export function loader({ request }: Route.LoaderArgs) {
	return generateRobotsTxt([
		{ type: 'sitemap', value: `${getOrigin(request)}/sitemap.xml` },
	])
}
