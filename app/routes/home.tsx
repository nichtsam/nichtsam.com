import { type MetaArgs } from 'react-router'
import { buildMeta } from '#app/utils/meta.ts'
import { type Route } from './+types/home'

export const meta: Route.MetaFunction = (args) =>
	buildMeta({
		args: args as unknown as MetaArgs,
		meta: {
			title: 'Home | nichtsam',
		},
	})

export default function Home() {
	return (
		<section className="container">
			<article className="prose lg:prose-xl py-9">
				<h1>Samuel Jensen</h1>
				<p>
					Hi there, I'm Sam.
					<br />
					You can call me Sam.
					<br />
					Oh and this is my website by the way.
				</p>
			</article>
		</section>
	)
}
