import { generateSitemap } from '@nasa-gcn/remix-seo'
import { type LoaderFunctionArgs, type ServerBuild } from '@remix-run/node'
import { getDomainUrl } from '#app/utils/request.server.ts'

export async function loader({ request, context }: LoaderFunctionArgs) {
	const serverBuild = (await context.serverBuild) as ServerBuild
	return generateSitemap(request, serverBuild.routes, {
		siteUrl: getDomainUrl(request),
	})
}
