import { createCookieSessionStorage, redirect } from '@remix-run/node'
import dayjs from 'dayjs'
import { and, eq, lt } from 'drizzle-orm'
import { redirectBack } from 'remix-utils/redirect-back'
import { safeRedirect } from 'remix-utils/safe-redirect'
import { type z } from 'zod'
import {
	connectionTable,
	userImageTable,
	sessionTable,
	userTable,
	type userSchema,
	type connectionSchema,
} from '#drizzle/schema.ts'
import { db } from '../db.server.ts'
import { env } from '../env.server.ts'
import { type Prettify, downloadFile } from '../misc.ts'
import { combineHeaders } from '../request.server.ts'

export const SESSION_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30
export const getSessionExpirationDate = () =>
	new Date(Date.now() + SESSION_EXPIRATION_TIME)

export const SESSION_ID_KEY = 'sessionId'
type AuthSession = {
	[SESSION_ID_KEY]: string
	expires: Date
}
export const authSessionStorage = createCookieSessionStorage<AuthSession>({
	cookie: {
		name: '_auth',
		sameSite: 'lax',
		path: '/',
		httpOnly: true,
		secrets: env.SESSION_SECRET.split(','),
		secure: env.NODE_ENV === 'production',
	},
})

const originCommitSession = authSessionStorage.commitSession
authSessionStorage.commitSession = async (session, options) => {
	if (options?.expires) {
		session.set('expires', options.expires)
	}
	if (options?.maxAge) {
		session.set('expires', new Date(Date.now() + options.maxAge * 1000))
	}

	const expires = session.has('expires') ? session.get('expires') : undefined

	const serializedCookie = originCommitSession(session, {
		...options,
		expires,
	})

	return serializedCookie
}

export const getAuthSession = async (request: Request) => {
	const authSession = await authSessionStorage.getSession(
		request.headers.get('cookie'),
	)
	const sessionId = authSession.get(SESSION_ID_KEY)

	return { authSession, sessionId }
}

export const getUserId = async (request: Request) => {
	const { authSession, sessionId } = await getAuthSession(request)

	if (!sessionId) {
		return null
	}

	const session = await db.query.sessionTable.findFirst({
		where: (sessionTable, { eq, and, gt }) =>
			and(
				eq(sessionTable.id, sessionId),
				gt(sessionTable.expiration_at, new Date()),
			),
	})

	if (!session) {
		throw redirect('/', {
			headers: {
				'set-cookie': await authSessionStorage.destroySession(authSession),
			},
		})
	}

	return session.user_id
}

export const getUser = async (userId: string) => {
	const user = await db.query.userTable.findFirst({
		where: (userTable, { eq }) => eq(userTable.id, userId),
		with: {
			image: {
				columns: { id: true },
			},
		},
	})

	if (!user) {
		return null
	}

	return {
		...user,
		createdAtFormatted: dayjs(user.created_at).format('MMM DD, YYYY'),
	}
}

export const requireAnonymous = async (request: Request) => {
	if (await getUserId(request)) {
		throw redirect('/')
	}
}

export const requireUserId = async (request: Request) => {
	const userId = await getUserId(request)

	if (!userId) {
		throw redirect('/login')
	}

	return userId
}

export const logout = async (
	{
		request,
		redirectTo,
	}: {
		request: Request
		redirectTo?: string
	},

	init?: ResponseInit,
) => {
	const { authSession, sessionId } = await getAuthSession(request)

	if (sessionId) {
		void db.delete(sessionTable).where(eq(sessionTable.id, sessionId)).then()
	}

	const responseInit = {
		...init,
		headers: combineHeaders(
			{
				'set-cookie': await authSessionStorage.destroySession(authSession),
			},
			init?.headers,
		),
	}

	if (redirectTo) {
		throw redirect(safeRedirect(redirectTo), responseInit)
	} else {
		throw redirectBack(request, {
			fallback: '/',
			...responseInit,
		})
	}
}

export const login = async (
	{
		request,
		redirectTo = '/',
		userId,
	}: {
		request: Request
		redirectTo?: string
		userId: string
	},
	init?: ResponseInit,
) => {
	await db
		.delete(sessionTable)
		.where(
			and(
				eq(sessionTable.user_id, userId),
				lt(sessionTable.expiration_at, new Date()),
			),
		)

	const session = (
		await db
			.insert(sessionTable)
			.values({
				user_id: userId,
				expiration_at: getSessionExpirationDate(),
			})
			.returning()
	)[0]!

	const { authSession } = await getAuthSession(request)
	authSession.set(SESSION_ID_KEY, session.id)

	throw redirect(safeRedirect(redirectTo), {
		headers: combineHeaders(init?.headers, {
			'set-cookie': await authSessionStorage.commitSession(authSession),
		}),
	})
}

export const signUpWithConnection = async ({
	connection: connectionInsert,
	user: { imageUrl: userImageUrl, ...userInsert },
}: {
	connection: Prettify<
		Pick<z.infer<typeof connectionSchema>, 'provider_name' | 'provider_id'>
	>
	user: Prettify<
		Pick<z.infer<typeof userSchema>, 'email' | 'username' | 'display_name'> & {
			imageUrl?: string
		}
	>
}) => {
	const user = (
		await db
			.insert(userTable)
			.values({
				email: userInsert.email.toLowerCase(),
				username: userInsert.username.toLowerCase(),
				display_name: userInsert.display_name,
			})
			.returning()
	)[0]!
	const user_id = user.id

	await db.insert(connectionTable).values({
		...connectionInsert,
		user_id,
	})

	if (userImageUrl) {
		await downloadFile(userImageUrl)
			.then((imageFile) =>
				db.insert(userImageTable).values({
					user_id,
					content_type: imageFile.contentType,
					blob: imageFile.blob,
				}),
			)
			.catch((e) => console.error(e))
	}

	const session = (
		await db
			.insert(sessionTable)
			.values({ user_id, expiration_at: getSessionExpirationDate() })
			.returning({
				id: sessionTable.id,
				expiration_at: sessionTable.expiration_at,
			})
	)[0]!

	return session
}
