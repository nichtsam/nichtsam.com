import { redirect } from 'react-router'
import { getUserId, login } from '#app/utils/auth/auth.server.ts'
import { createAuthenticator } from '#app/utils/auth/magic-link.server.ts'
import { onboardingCookie } from '#app/utils/auth/onboarding.server.ts'
import { db } from '#app/utils/db.server.ts'
import { getRedirect } from '#app/utils/redirect.server.ts'
import { mergeHeaders } from '#app/utils/request.server.ts'
import { ServerTiming } from '#app/utils/timings.server.ts'
import { redirectWithToast } from '#app/utils/toast.server.ts'
import { type Route } from './+types/auth.magic'

export const loader = async ({ request }: Route.LoaderArgs) => {
	const authenticator = createAuthenticator(request)
	const timing = new ServerTiming()

	timing.time('authenticate email', 'Authenticate email')
	const authResult = await authenticator
		.authenticate('email-link', request)
		.then(
			(data) =>
				({
					success: true,
					data,
				}) as const,
			(error) =>
				({
					success: false,
					error,
				}) as const,
		)
	timing.timeEnd('authenticate email')

	if (!authResult.success) {
		console.error(authResult.error)

		throw redirect('/login')
	}

	const email = authResult.data

	const { redirectTo, discardHeaders } = getRedirect(request) ?? {}
	const headers = new Headers()
	mergeHeaders(headers, discardHeaders)

	timing.time('get user id', 'Get user id in database')
	const userId = await getUserId(request)
	timing.timeEnd('get user id')

	// logged in
	if (userId) {
		headers.append('Server-Timing', timing.toString())
		return redirectWithToast(
			'/settings/profile',
			{
				type: 'error',
				title: 'Already Signed In',
				message: `You are already signed in with an account.`,
			},
			{ headers },
		)
	}

	timing.time('get email owner', 'Get email owner in database')
	const emailOwner = await db.query.userTable.findFirst({
		where: (userTable, { eq }) => eq(userTable.email, email),
	})
	timing.timeEnd('get email owner')

	if (emailOwner) {
		headers.append('Server-Timing', timing.toString())
		return await login(
			{
				request,
				redirectTo,
				userId: emailOwner.id,
			},
			{ headers },
		)
	}

	// real new user, send to onboarding
	headers.append(
		'set-cookie',
		await onboardingCookie.serialize({
			type: 'magic-link',
			email,
		}),
	)

	headers.append('Server-Timing', timing.toString())
	throw redirect('/onboarding', { headers })
}
