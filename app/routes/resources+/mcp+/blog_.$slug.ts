import { data } from 'react-router'
import { posts as config } from '#app/utils/content/config.ts'
import { getMdxSource } from '#app/utils/content/mdx/mdx.server.ts'
import { retrieve } from '#app/utils/content/retrieve.ts'
import { ServerTiming, time } from '#app/utils/timings.server.ts'
import { type Route } from './+types/blog_.$slug'

export async function loader({ params }: Route.LoaderArgs) {
	if (!params.slug) {
		throw new Error('params.slug is not defined')
	}

	const slug = params.slug
	const timing = new ServerTiming()

	const post = await time(timing, 'get post', () =>
		retrieve(config, slug, timing),
	)

	if (!post) {
		return new Response('Not found', {
			status: 404,
			headers: {
				'Server-Timing': timing.toString(),
			},
		})
	}

	const bundleSource = await time(timing, 'get mdx source', () =>
		getMdxSource(post.meta),
	)

	if (!bundleSource) {
		return new Response(`Failed to get blog post for slug: ${slug}`, {
			status: 500,
			headers: {
				'Server-Timing': timing.toString(),
			},
		})
	}

	const source = `${post.meta.base}:\n\n${bundleSource.source}`
	const files = bundleSource.files
		? Object.entries(bundleSource.files)
				.map(([filename, content]) => `${filename}:\n\n${content}`)
				.join('\n\n')
		: null

	return data([source, files].join('\n\n'), {
		headers: {
			'Cache-Control': 'max-age=86400',
			'Server-Timing': timing.toString(),
		},
	})
}
