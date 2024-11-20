import { generateRobotsTxt } from '@nasa-gcn/remix-seo'
import { type LoaderFunctionArgs } from '@remix-run/node'
import { getDomainUrl } from '#app/utils/request.server.ts'

export function loader({ request }: LoaderFunctionArgs) {
	return generateRobotsTxt([
		{ type: 'sitemap', value: `${getDomainUrl(request)}/sitemap.xml` },
		{ type: 'disallow', value: '/auth' },
		{ type: 'disallow', value: '/settings' },
	])
}
