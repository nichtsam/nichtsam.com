import { type SEOHandle } from '@nasa-gcn/remix-seo'
import { usePostHog } from '@posthog/react'
import { useEffect } from 'react'
import { data, type MetaArgs, useLoaderData } from 'react-router'
import { serverOnly$ } from 'vite-env-only/macros'
import {
	GeneralErrorBoundary,
	generalNotFoundHandler,
} from '#app/components/error-boundary.tsx'
import shikiStylesheet from '#app/styles/shiki.css?url'
import { useMdxComponent } from '#app/utils/content/mdx.tsx'
import { env } from '#app/utils/env.server.ts'
import { pipeHeaders } from '#app/utils/headers.server.ts'
import { buildMeta } from '#app/utils/meta.ts'
import { allArticles } from '#content-collections'
import { type Route } from './+types/articles_.$slug'

export const links: Route.LinksFunction = () => [
	{ rel: 'stylesheet', href: shikiStylesheet },
]

export const handle: SEOHandle = {
	getSitemapEntries: serverOnly$(async () => {
		return allArticles.map((article) =>
			article.draft ? null : { route: `/articles/${article.slug}` },
		)
	}),
}

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
				'Cache-Control': 'max-age=86400',
				...(env.ALLOW_INDEXING &&
					article.draft && { 'X-Robots-Tag': 'noindex, nofollow' }),
			},
		},
	)
}

export default function Article() {
	const data = useLoaderData<typeof loader>()
	const Component = useMdxComponent(data.article.mdx)
	const posthog = usePostHog()

	const { slug, title, publishedDate, readingTime, draft } = data.article
	useEffect(() => {
		posthog?.capture('article_viewed', {
			slug,
			title,
			published_date: publishedDate,
			reading_time: readingTime,
			is_draft: draft,
		})
	}, [slug, title, publishedDate, readingTime, draft, posthog])

	return (
		<div>
			<article className="prose dark:prose-invert xl:prose-lg 2xl:prose-2xl container">
				{data.article.draft && (
					<blockquote className="border-l-4 border-yellow-500 bg-yellow-100 p-4 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
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
