import { Img } from 'openimg/react'
import { type MetaArgs } from 'react-router'
import { pipeHeaders } from '#app/utils/headers.server.ts'
import { buildMeta } from '#app/utils/meta.ts'
import { type Route } from './+types/_index'

export const meta: Route.MetaFunction = (args) =>
	buildMeta({
		args: args as unknown as MetaArgs,
		meta: {
			title: 'Home | nichtsam',
		},
	})

export const headers: Route.HeadersFunction = (args) => {
	args.loaderHeaders.set('Cache-Control', 'max-age=86400')
	return pipeHeaders(args)
}

export default function Index() {
	return (
		<section className="container flex flex-col-reverse justify-between md:flex-row">
			<article className="prose dark:prose-invert lg:prose-xl py-9">
				<h1>Samuel Jensen</h1>
				<p>
					Hi there, I'm Sam.
					<br />
					You can call me Sam.
					<br />
					Oh and this is my website by the way.
				</p>
			</article>
			<div className="flex items-center justify-center">
				<Img
					className="size-64"
					isAboveFold
					height={384}
					width={384}
					src="public:/images/samuel-figure.png"
				/>
			</div>
		</section>
	)
}
