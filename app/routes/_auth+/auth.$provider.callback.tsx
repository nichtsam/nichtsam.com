import { redirect, type LoaderFunctionArgs } from '@remix-run/node'
import { getUserId, login } from '#app/utils/auth/auth.server.ts'
import {
	createAuthenticator,
	connectionSessionStorage,
} from '#app/utils/auth/connections.server.ts'
import {
	ProviderNameSchema,
	providerConfigs,
} from '#app/utils/auth/connections.tsx'
import { onboardingCookie } from '#app/utils/auth/onboarding.server.ts'
import { db } from '#app/utils/db.server.ts'
import { getRedirect } from '#app/utils/redirect.server.ts'
import {
	combineHeaders,
	destroySession,
	mergeHeaders,
} from '#app/utils/request.server.ts'
import { ServerTiming } from '#app/utils/timings.server.ts'
import {
	createToastHeaders,
	redirectWithToast,
} from '#app/utils/toast.server.ts'
import { connectionTable } from '#drizzle/schema.ts'

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	const authenticator = createAuthenticator(request)
	const providerName = ProviderNameSchema.parse(params.provider)
	const label = providerConfigs[providerName].label

	const timing = new ServerTiming()

	timing.time('get oauth profile', 'Get OAuth Profile')
	const authResult = await authenticator
		.authenticate(providerName, request)
		.then(
			(data) => ({ success: true, data }) as const,
			(error) => ({ success: false, error }) as const,
		)
	timing.timeEnd('get oauth profile')

	if (!authResult.success) {
		console.error(authResult.error)

		throw redirect('/login')
	}

	const profile = authResult.data

	const { redirectTo, discardHeaders } = getRedirect(request) ?? {}
	const headers = new Headers({
		'set-cookie': await destroySession(connectionSessionStorage, request),
	})
	mergeHeaders(headers, discardHeaders)

	timing.time(
		'find existing connection',
		'Find existing connection in database',
	)
	const existingConnection = await db.query.connectionTable.findFirst({
		where: (connections, { eq, and }) =>
			and(
				eq(connections.provider_name, providerName),
				eq(connections.provider_id, profile.id),
			),
	})
	timing.timeEnd('find existing connection')

	timing.time('get user id', 'Get user id in database')
	const userId = await getUserId(request)
	timing.timeEnd('get user id')

	// logged in
	if (userId) {
		// new connection coming in, bind it to user
		if (!existingConnection) {
			timing.time('insert connection', 'Relate connection to user')
			await db.insert(connectionTable).values({
				user_id: userId,
				provider_id: profile.id,
				provider_name: providerName,
			})
			timing.timeEnd('insert connection')

			headers.append('Server-Timing', timing.toString())
			return redirectWithToast(
				'/settings/profile/connections',
				{
					type: 'success',
					title: 'Connected',
					message: `Your ${label} account "${profile.username}" has been connected.`,
				},
				{ headers },
			)
		}

		// notify connection status
		if (existingConnection.user_id === userId) {
			headers.append('Server-Timing', timing.toString())
			return redirectWithToast(
				'/settings/profile/connections',
				{
					title: 'Already Connected',
					message: `Your ${label} account "${profile.username}" is already connected.`,
				},
				{ headers },
			)
		} else {
			headers.append('Server-Timing', timing.toString())
			return redirectWithToast(
				'/settings/profile/connections',
				{
					type: 'error',
					title: 'Already Taken',
					message: `The ${label} account "${profile.username}" is already taken by another account.`,
				},
				{ headers },
			)
		}
	}

	// not logged in but the connection is bound to a user, login that user
	if (existingConnection) {
		headers.append('Server-Timing', timing.toString())
		return await login(
			{
				request,
				redirectTo,
				userId: existingConnection.user_id,
			},
			{ headers },
		)
	}

	// check if any user owns this connection's email, bind to that user and login
	let emailOwner
	if (profile.email) {
		const email = profile.email
		emailOwner = await db.query.userTable.findFirst({
			where: (userTable, { eq }) => eq(userTable.email, email),
		})
	}

	if (emailOwner) {
		timing.time('insert connection', 'Relate connection to user')
		await db.insert(connectionTable).values({
			provider_id: profile.id,
			provider_name: providerName,
			user_id: emailOwner.id,
		})
		timing.timeEnd('insert connection')

		headers.append('Server-Timing', timing.toString())
		return await login(
			{
				request,
				redirectTo,
				userId: emailOwner.id,
			},
			{
				headers: combineHeaders(
					headers,
					await createToastHeaders({
						title: 'One User Per Email',
						message: `Your ${label} account "${profile.username}" has been connected to the email user.`,
					}),
				),
			},
		)
	}

	// real new user, send to onboarding
	headers.append(
		'set-cookie',
		await onboardingCookie.serialize({
			providerId: profile.id,
			providerName,
			profile: {
				email: profile.email,
				imageUrl: profile.imageUrl,
				displayName: profile.name ?? undefined,
				username: profile.username,
			},
		}),
	)

	headers.append('Server-Timing', timing.toString())
	throw redirect('/onboarding', { headers })
}
