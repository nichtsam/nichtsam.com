import {
	data,
	type HeadersFunction,
	type MetaFunction,
	Link,
	useLoaderData,
} from 'react-router'
import { type PostInfo, getPostInfos } from '#app/utils/mdx/blog.server.ts'
import { pipeHeaders } from '#app/utils/remix.server.ts'
import { ServerTiming } from '#app/utils/timings.server.ts'

export const meta: MetaFunction = () => {
	return [
		{ title: 'Blog | nichtsam' },
		{
			name: 'description',
			content:
				'Blog posts written by Samuel, where he shares his thoughts, ideas, and insights on a variety of topics.',
		},
	]
}

export const headers: HeadersFunction = pipeHeaders

export const loader = async () => {
	const timing = new ServerTiming()

	timing.time('get posts', 'Get posts')
	const posts = await getPostInfos()
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
					<PostItem key={post.slug} post={post} />
				))}
			</ul>
		</div>
	)
}

function PostItem({ post }: { post: PostInfo }) {
	return (
		<li>
			<Link
				to={post.slug}
				className="inline-block w-full rounded-md p-4 hover:bg-accent hover:text-accent-foreground"
			>
				<div className="flex items-baseline justify-between gap-x-2">
					<div>
						<h3 className="mr-2 inline text-lg">{post.meta.matter.title}</h3>

						<span className="whitespace-pre text-sm text-muted-foreground">
							{post.meta.readingTime.text}
						</span>
					</div>

					<time dateTime={post.meta.matter.publishedDate} className="shrink-0">
						{post.meta.matter.publishedDate}
					</time>
				</div>

				<p className="text-muted-foreground">{post.meta.matter.description}</p>
			</Link>
		</li>
	)
}
