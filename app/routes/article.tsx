import { data, type MetaArgs, useLoaderData } from 'react-router'
import {
	GeneralErrorBoundary,
	generalNotFoundHandler,
} from '#app/components/error-boundary.tsx'
import { useMdxComponent } from '#app/utils/content/mdx.tsx'
import { env } from '#app/utils/env.server.ts'
import { pipeHeaders } from '#app/utils/headers.server.ts'
import { buildMeta } from '#app/utils/meta.ts'
import { allArticles } from '#content-collections'
import { type Route } from './+types/article'

export const headers: Route.HeadersFunction = pipeHeaders

export const meta: Route.MetaFunction = (args) => [
	...buildMeta({
		args: args as unknown as MetaArgs,
		meta: {
			title: `${args.loaderData?.article.title} | nichtsam`,
			description: args.loaderData?.article.description,
		},
	}),

	...(!args.error &&
	args.matches[0].loaderData.env.ALLOW_INDEXING &&
	args.loaderData &&
	args.loaderData.article.draft
		? [{ name: 'robots', content: 'noindex, nofollow' }]
		: []),
]

export const loader = async ({ params }: Route.LoaderArgs) => {
	const article = allArticles.find((p) => p.slug === params.slug)

	if (!article) {
		throw new Response('Not found', { status: 404 })
	}

	return data(
		{ article },
		{
			headers: {
				...(env.ALLOW_INDEXING &&
					article.draft && { 'X-Robots-Tag': 'noindex, nofollow' }),
			},
		},
	)
}

export default function Article() {
	const data = useLoaderData<typeof loader>()
	const Component = useMdxComponent(data.article.mdx)

	return (
		<div>
			<article className="prose xl:prose-lg 2xl:prose-2xl container">
				{data.article.draft && (
					<blockquote className="border-l-4 border-yellow-500 bg-yellow-100 p-4 text-yellow-800">
						Draft! Article Work In Progress!
					</blockquote>
				)}
				<Component />
			</article>
		</div>
	)
}

export function ErrorBoundary() {
	return (
		<GeneralErrorBoundary
			statusHandlers={{
				404: generalNotFoundHandler,
			}}
		/>
	)
}
