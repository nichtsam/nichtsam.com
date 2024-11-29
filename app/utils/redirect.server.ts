import { parse as parseCookie, serialize as serializeCookie } from 'cookie'
import { getCookieHeader } from './request.server.ts'

const cookieName = 'redirectTo'

export function setRedirectCookie(redirectTo: string) {
	return serializeCookie(cookieName, redirectTo, { maxAge: 60 })
}

export function getRedirect(request: Request) {
	const cookieHeader = getCookieHeader(request)
	if (!cookieHeader) {
		return null
	}

	const redirectTo = parseCookie(cookieHeader)[cookieName]

	if (!redirectTo) {
		return null
	}

	return {
		redirectTo,
		discardHeaders: new Headers({
			'set-cookie': serializeCookie(cookieName, '', { maxAge: -1 }),
		}),
	}
}
