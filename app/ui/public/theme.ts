export type Theme = 'light' | 'dark'

export const THEME_EVENT = 'app:themechange'

export function getTheme(): Theme {
	return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

export function setTheme(theme: Theme) {
	document.documentElement.dataset.theme = theme
	try {
		localStorage.setItem('theme', theme)
	} catch {}
	document.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: theme }))
}

export function toggleTheme() {
	setTheme(getTheme() === 'dark' ? 'light' : 'dark')
}

export function prefersReducedMotion() {
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
