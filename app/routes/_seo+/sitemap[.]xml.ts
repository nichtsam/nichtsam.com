import { generateSitemap } from '@nasa-gcn/remix-seo'
import { getDomainUrl } from '#app/utils/request.server.ts'
import { type Route } from './+types/sitemap[.]xml'

export async function loader({ request, context }: Route.LoaderArgs) {
	const serverBuild = await context.serverBuild
	// @ts-expect-error @nasa-gcn/remix-seo using old remix type
	return generateSitemap(request, serverBuild.routes, {
		siteUrl: getDomainUrl(request),
	})
}
