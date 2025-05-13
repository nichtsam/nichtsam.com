import { data } from 'react-router'
import { posts as config } from '#app/utils/content/config.ts'
import { retrieveAll } from '#app/utils/content/retrieve.ts'
import { ServerTiming, time } from '#app/utils/timings.server.ts'

export async function loader() {
	const timing = new ServerTiming()

	const postCollection = await time(timing, 'get posts', () =>
		retrieveAll(config, timing),
	)

	const posts = postCollection
		.filter((post) => !post.matter.draft)
		.map((post) => ({
			readingTime: post.readingTime,
			matter: post.matter,
			slug: post.meta.slug,
		}))

	return data(posts, {
		headers: {
			'Cache-Control': 'max-age=86400',
			'Server-Timing': timing.toString(),
		},
	})
}
