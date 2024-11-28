import { isUser, useOptionalUser } from '#app/utils/user.tsx'

export default function Contact() {
	const optionalUser = useOptionalUser()
	const isLoggedIn = isUser(optionalUser)

	return (
		<section className="container py-9">
			<article className="prose dark:prose-invert lg:prose-xl">
				<h2>Send Me A Message</h2>
				<p>
					<a href="https://www.linkedin.com/in/nichtsam/">LinkedIn</a>
				</p>
				<h2>Schedule A Chat</h2>
				<a href="https://cal.com/nichtsam">cal.com/nichtsam</a>
				<h2>Send Me An Email</h2>
				{isLoggedIn ? (
					<a href="mailto:me@nichtsam.com">me@nichtsam.com</a>
				) : (
					<p>
						To help keep me spam-free, please log in to see the email address.
					</p>
				)}
			</article>
		</section>
	)
}
