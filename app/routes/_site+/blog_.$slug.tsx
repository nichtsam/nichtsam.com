import { type SEOHandle } from '@nasa-gcn/remix-seo'
import { data, type MetaArgs, useLoaderData } from 'react-router'
import { serverOnly$ } from 'vite-env-only/macros'
import {
	GeneralErrorBoundary,
	generalNotFoundHandler,
} from '#app/components/error-boundary.tsx'
import shikiStylesheet from '#app/styles/shiki.css?url'
import { posts as config } from '#app/utils/content/config.ts'
import { bundleMDX } from '#app/utils/content/mdx/bundler.server.ts'
import { getMdxSource } from '#app/utils/content/mdx/mdx.server.ts'
import { useMdxComponent } from '#app/utils/content/mdx/mdx.tsx'
import { retrieve, retrieveAll } from '#app/utils/content/retrieve.ts'
import { pipeHeaders } from '#app/utils/headers.server.ts'
import { buildMeta } from '#app/utils/meta.ts'
import { ServerTiming } from '#app/utils/timings.server'
import { type Route } from './+types/blog_.$slug'

export const links: Route.LinksFunction = () => [
	{ rel: 'stylesheet', href: shikiStylesheet },
]

export const handle: SEOHandle = {
	getSitemapEntries: serverOnly$(async () => {
		const posts = await retrieveAll(config)
		return posts.map((post) => ({ route: `/blog/${post.meta.name}` }))
	}),
}

export const headers: Route.HeadersFunction = pipeHeaders

export const meta: Route.MetaFunction = (args) =>
	buildMeta(args as unknown as MetaArgs, {
		title: `${args.data.matter.title} | nichtsam`,
		description: args.data.matter.description,
	})

export const loader = async ({ params }: Route.LoaderArgs) => {
	if (!params.slug) {
		throw new Error('params.slug is not defined')
	}

	const slug = params.slug
	const timing = new ServerTiming()

	timing.time('get post', 'Get post')
	const post = await retrieve(config, slug, timing)
	timing.timeEnd('get post')

	if (!post) {
		throw new Response('Not found', {
			status: 404,
			headers: {
				'Server-Timing': timing.toString(),
			},
		})
	}

	const bundleSource = await getMdxSource(post.meta)
	const { code } = await bundleMDX({
		slug,
		bundleSource,
		timing,
	})

	return data(
		{
			code,
			matter: post.matter,
		},
		{
			headers: {
				'Cache-Control': 'max-age=86400',
				'Server-Timing': timing.toString(),
			},
		},
	)
}

export default function BlogPost() {
	const data = useLoaderData<typeof loader>()
	const Component = useMdxComponent(data.code)

	return (
		<div>
			<article className="container prose dark:prose-invert xl:prose-lg 2xl:prose-2xl">
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
