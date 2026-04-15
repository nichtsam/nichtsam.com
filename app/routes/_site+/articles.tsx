import { data, Link, type MetaArgs, useLoaderData } from 'react-router'
import { pipeHeaders } from '#app/utils/headers.server.ts'
import { buildMeta } from '#app/utils/meta.ts'
import { allArticles } from '#content-collections'
import { type Route } from './+types/articles'

export const meta: Route.MetaFunction = (args) =>
	buildMeta({
		args: args as unknown as MetaArgs,
		meta: {
			title: 'Articles | nichtsam',
			description:
				'Articles written by Samuel, where he shares his thoughts, ideas, and insights on a variety of topics.',
		},
	})

export const headers: Route.HeadersFunction = pipeHeaders

export const loader = async () => {
	const posts = allArticles
		.filter((article) => !article.draft)
		.map((article) => ({
			readingTime: article.readingTime,
			matter: {
				title: article.title,
				description: article.description,
				publishedDate: article.publishedDate,
			},
			slug: article.slug,
		}))

	return data({ posts })
}

export default function Articles() {
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

function PostItem({
	post,
}: {
	post: ReturnType<typeof useLoaderData<typeof loader>>['posts'][number]
}) {
	return (
		<li>
			<Link
				to={post.slug}
				className="hover:bg-accent hover:text-accent-foreground inline-block w-full rounded-md p-4 transition ease-out hover:scale-105"
			>
				<div className="flex items-baseline justify-between gap-x-2">
					<div>
						<h3 className="mr-2 inline text-lg">{post.matter.title}</h3>

						<span className="text-muted-foreground text-sm whitespace-pre">
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
