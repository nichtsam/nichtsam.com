import { getContext } from 'remix/middleware/async-context'
import { createContextKey, type Middleware } from 'remix/router'

export type Theme = 'light' | 'dark'

export const THEME_COOKIE = 'theme'
const ONE_YEAR = 60 * 60 * 24 * 365

/** The visitor's chosen theme, or `null` to follow their system setting. */
export const ThemeKey = createContextKey<Theme | null>(null)

export function parseTheme(cookieHeader: string | null): Theme | null {
	let match = /(?:^|;\s*)theme=(light|dark)(?:;|$)/.exec(cookieHeader ?? '')
	return (match?.[1] as Theme | undefined) ?? null
}

/** Readable by page scripts on purpose: the toggle writes it without a round trip. */
export function serializeThemeCookie(theme: Theme, secure: boolean) {
	return `${THEME_COOKIE}=${theme}; Path=/; Max-Age=${ONE_YEAR}; SameSite=Lax${secure ? '; Secure' : ''}`
}

export function theme(): Middleware<{ key: typeof ThemeKey; value: Theme | null }> {
	return (context, next) => {
		context.set(ThemeKey, parseTheme(context.headers.get('Cookie')))
		return next()
	}
}

/** The theme for the page being rendered, so the server sends the right colors up front. */
export function currentTheme(): Theme | null {
	return getContext().get(ThemeKey)
}
