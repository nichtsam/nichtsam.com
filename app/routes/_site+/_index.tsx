import { type HeadersFunction, type MetaFunction } from 'react-router'
import { pipeHeaders } from '#app/utils/remix.server.ts'

export const meta: MetaFunction = () => {
	return [
		{ title: 'Home | nichtsam' },
		{
			name: 'description',
			content:
				'Welcome to nichtsam.com! Explore the site to learn more about Samuel, his projects, and ideas.',
		},
	]
}

export const headers: HeadersFunction = (args) => {
	args.loaderHeaders.set('Cache-Control', 'max-age=86400')
	return pipeHeaders(args)
}

export default function Index() {
	return (
		<section className="container py-9">
			<article className="prose dark:prose-invert lg:prose-xl">
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
