export function removeTrailingSlash(s: string) {
	return s.endsWith('/') ? s.slice(0, -1) : s
}

export function getOrigin(request: Request) {
	const host =
		request.headers.get('X-Forwarded-Host') ??
		request.headers.get('host') ??
		new URL(request.url).host
	const protocol = request.headers.get('X-Forwarded-Proto') ?? 'http'
	return `${protocol}://${host}`
}
