import { EmailLinkStrategy } from '@nichtsam/remix-auth-email-link'
import { Authenticator } from 'remix-auth'
import { sendMagicLinkEmail } from '../email.server'
import { env } from '../env.server'
import { getDomainUrl } from '../request.server'

export const createAuthenticator = (request: Request) => {
	const authenticator = new Authenticator<string>()
	const magicEndpoint = new URL('/auth/magic', getDomainUrl(request))
	authenticator.use(
		new EmailLinkStrategy(
			{
				secret: env.MAGIC_LINK_SECRET,
				shouldValidateSessionMagicLink: true,
				magicEndpoint,
				sendEmail: ({ email, magicLink }) =>
					sendMagicLinkEmail({ email, magicLink, domain: magicEndpoint.host }),
			},
			async ({ email }) => email,
		),
	)

	return authenticator
}
