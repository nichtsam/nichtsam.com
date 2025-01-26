import {
	Html,
	Head,
	Preview,
	Body,
	Container,
	Heading,
	Link,
	Text,
} from '@react-email/components'
import { type User } from '#drizzle/schema.ts'

export namespace MagicLink {
	export type Props = {
		magicLink: string
		user?: User
	}
}
export function MagicLinkEmail({ magicLink, user }: MagicLink.Props) {
	return (
		<Html>
			<Head />
			<Preview>Log in or sign up with your magic link.</Preview>
			<Body>
				<Container>
					<Heading as="h2">
						{user
							? `Hey ${user.display_name}! Welcome back!`
							: `Hey there! Welcome!`}
					</Heading>

					<Heading as="h3">🎩 Here's your magic link</Heading>
					<Link href={magicLink}>👉 {user ? 'Log In' : 'Sign Up'}</Link>
					<Text>
						If you didn’t request this email, you can safely ignore it.
					</Text>
					<Text>
						This link is only valid for ten minutes.
						<br />
						If it has expired, you can request a new one.
					</Text>
				</Container>
			</Body>
		</Html>
	)
}

export default MagicLinkEmail
