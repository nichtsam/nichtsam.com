import { data, Link, type MetaArgs, useLoaderData } from 'react-router'
import { posts as config } from '#app/utils/content/config.ts'
import { retrieveAll } from '#app/utils/content/retrieve.ts'
import { pipeHeaders } from '#app/utils/headers.server.ts'
import { buildMeta } from '#app/utils/meta.ts'
import { ServerTiming } from '#app/utils/timings.server.ts'
import { type Route } from './+types/blog'

export const meta: Route.MetaFunction = (args) =>
	buildMeta(args as unknown as MetaArgs, {
		title: 'Blog | nichtsam',
		description:
			'Blog posts written by Samuel, where he shares his thoughts, ideas, and insights on a variety of topics.',
	})

export const headers: Route.HeadersFunction = pipeHeaders

export const loader = async () => {
	const timing = new ServerTiming()

	timing.time('get posts', 'Get posts')
	const posts = await retrieveAll(config, timing)
	timing.timeEnd('get posts')

	return data(
		{ posts },
		{
			headers: {
				'Cache-Control': 'max-age=86400',
				'Server-Timing': timing.toString(),
			},
		},
	)
}

export default function Blog() {
	const data = useLoaderData<typeof loader>()
	return (
		<div className="container max-w-[80ch]">
			<ul className="flex flex-col gap-y-2">
				{data.posts.map((post) => (
					<PostItem key={post.meta.name} post={post} />
				))}
			</ul>
		</div>
	)
}

function PostItem({
	post,
}: {
	post: ReturnType<typeof useLoaderData<typeof loader>>['posts'][number]
}) {
	return (
		<li>
			<Link
				to={post.meta.slug}
				className="inline-block w-full rounded-md p-4 transition ease-out hover:scale-105 hover:bg-accent hover:text-accent-foreground"
			>
				<div className="flex items-baseline justify-between gap-x-2">
					<div>
						<h3 className="mr-2 inline text-lg">{post.matter.title}</h3>

						<span className="whitespace-pre text-sm text-muted-foreground">
							{post.readingTime}
						</span>
					</div>

					<time dateTime={post.matter.publishedDate} className="shrink-0">
						{post.matter.publishedDate}
					</time>
				</div>

				<p className="text-muted-foreground">{post.matter.description}</p>
			</Link>
		</li>
	)
}
