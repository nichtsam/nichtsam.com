import { type SEOHandle } from '@nasa-gcn/remix-seo'
import {
	data,
	type HeadersFunction,
	type LoaderFunctionArgs,
	type MetaFunction,
} from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { serverOnly$ } from 'vite-env-only/macros'
import { getPostInfos, getPostMeta } from '#app/utils/mdx/blog.server'
import { bundleMDX } from '#app/utils/mdx/compile-mdx.server'
import { useMdxComponent } from '#app/utils/mdx/mdx'
import { getMdxBundleSource, getMdxEntry } from '#app/utils/mdx/mdx.server'
import { pipeHeaders } from '#app/utils/remix.server'
import { ServerTiming } from '#app/utils/timings.server'

export const handle: SEOHandle = {
	getSitemapEntries: serverOnly$(async () => {
		const posts = await getPostInfos()
		return posts.map((post) => ({ route: `/blog/${post.slug}` }))
	}),
}

export const headers: HeadersFunction = pipeHeaders

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	if (!data) {
		return [
			{ title: 'Error | nichtsam' },
			{ name: 'description', content: 'Some error occured' },
		]
	}
	return [
		{ title: `${data.meta.matter.title} | nichtsam` },
		{ name: 'description', content: data.meta.matter.description },
	]
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
	if (!params.slug) {
		throw new Error('params.slug is not defined')
	}

	const slug = params.slug
	const timing = new ServerTiming()

	timing.time('get post mdx bundle', 'Get post mdx bundle')
	const mdxEntry = getMdxEntry('blog', slug)
	const mdxBundle = await getMdxBundleSource(mdxEntry)
	timing.timeEnd('get post mdx bundle')

	timing.time('bundle post mdx', 'Bundle post mdx')
	const { code } = await bundleMDX({ slug, bundle: mdxBundle, timing })
	timing.timeEnd('bundle post mdx')

	timing.time('get post meta', 'Get post meta')
	const meta = getPostMeta(mdxBundle.source)
	timing.timeEnd('get post meta')

	return data(
		{
			code,
			meta,
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
