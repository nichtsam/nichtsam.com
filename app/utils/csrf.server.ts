import { createCookie } from '@remix-run/node'
import { CSRF, CSRFError } from 'remix-utils/csrf/server'
import { env } from './env.server.ts'

const cookie = createCookie('csrf', {
	path: '/',
	httpOnly: true,
	secure: env.NODE_ENV === 'production',
	sameSite: 'lax',
	secrets: env.SESSION_SECRET.split(','),
})

export const csrf = new CSRF({
	cookie,
	secret: env.CSRF_SECRET,
})

export async function validateCSRF(formData: FormData, headers: Headers) {
	try {
		await csrf.validate(formData, headers)
	} catch (error) {
		if (error instanceof CSRFError) {
			throw new Response(error.message, { status: 403 })
		}
		throw error
	}
}
