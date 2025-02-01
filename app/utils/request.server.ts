import { type Cookie, type SessionStorage } from 'react-router'

const getFormData = async (request: Request) => {
	try {
		return await request.clone().formData()
	} catch (err: unknown) {
		console.error(err)
		throw new Response('Invalid form', { status: 400 })
	}
}

const mergeHeaders = (
	main: Headers,
	...headers: Array<ResponseInit['headers'] | null | undefined>
) => {
	for (const header of headers) {
		if (!header) continue
		for (const [key, value] of new Headers(header).entries()) {
			main.append(key, value)
		}
	}
}

const combineHeaders = (
	...headers: Array<ResponseInit['headers'] | null | undefined>
) => {
	const combined = new Headers()
	mergeHeaders(combined, ...headers)
	return combined
}

const getCookieHeader = (request: Request) => {
	return request.headers.get('cookie')
}

const destroyCookie = (cookie: Cookie) => {
	return cookie.serialize(null, { expires: new Date(Date.now() - 1) })
}

const getSession = (storage: SessionStorage, request: Request) => {
	const cookieHeader = getCookieHeader(request)
	const session = storage.getSession(cookieHeader)

	return session
}

const destroySession = async (storage: SessionStorage, request: Request) => {
	const session = await getSession(storage, request)
	return storage.destroySession(session)
}

const getDomainUrl = (request: Request) => {
	const host =
		request.headers.get('X-Forwarded-Host') ??
		request.headers.get('host') ??
		new URL(request.url).host
	const protocol = host.includes('localhost') ? 'http' : 'https'
	return `${protocol}://${host}`
}

export {
	getFormData,
	mergeHeaders,
	combineHeaders,
	getCookieHeader,
	destroyCookie,
	getSession,
	destroySession,
	getDomainUrl,
}
