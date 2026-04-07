import { type MetaArgs } from 'react-router'
import { pipeHeaders } from '#app/utils/headers.server.ts'
import { buildMeta } from '#app/utils/meta.ts'
import { type Route } from './+types/contact'

export const meta: Route.MetaFunction = (args) =>
	buildMeta({
		args: args as unknown as MetaArgs,
		meta: {
			title: 'Contact | nichtsam',
			description:
				'Get in touch with Samuel through various channels. Whether it’s via email, social media, or another method, feel free to reach out, and Samuel will respond as soon as possible.',
		},
	})

export const headers: Route.HeadersFunction = (args) => {
	args.loaderHeaders.set('Cache-Control', 'max-age=86400')
	return pipeHeaders(args)
}

export default function Contact() {
	return (
		<section className="container py-9">
			<article className="prose dark:prose-invert lg:prose-xl">
				<h2>Send Me A Message</h2>
				<p>
					<a href="https://www.linkedin.com/in/nichtsam/">LinkedIn</a>
				</p>
				<h2>Schedule A Chat</h2>
				<a href="https://cal.com/nichtsam">cal.com/nichtsam</a>
			</article>
		</section>
	)
}
