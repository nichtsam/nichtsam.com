/**
 * Pages are the same for everyone except for the theme, which comes from a
 * cookie, so caches must keep one copy per cookie.
 */
export const pageHeaders = {
	'Cache-Control': 'public, max-age=300, stale-while-revalidate=86400',
	Vary: 'Cookie',
}
