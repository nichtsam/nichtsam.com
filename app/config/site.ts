// Fixed so pages don't need a request to know their own origin
const siteOrigin = 'https://nichtsam.com'

export function siteUrl(path: string) {
	// Canonical URLs have no trailing slash, so the home page is the bare origin
	return `${siteOrigin}${path.endsWith('/') ? path.slice(0, -1) : path}`
}
