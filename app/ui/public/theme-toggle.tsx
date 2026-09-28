import { clientEntry, css, on } from 'remix/ui'
import type { Handle } from 'remix/ui'

import { Doodle } from './sketch.tsx'

type Theme = 'light' | 'dark'

export type ThemeToggleProps = {
	/** The visitor's saved choice, or null to follow the system. */
	theme: Theme | null
	/** Where the form posts without JavaScript. */
	action: string
	/** Where the server sends the visitor back to afterwards. */
	returnTo: string
}

export const THEME_FORM_ID = 'theme-form'

/**
 * Day/night switch. Without JavaScript it is a plain form that the server
 * answers with a cookie and a redirect back; with JavaScript the page flips
 * in place and writes the same cookie.
 */
export const ThemeToggle = clientEntry(
	import.meta.url,
	function ThemeToggle(handle: Handle<ThemeToggleProps>) {
		let theme = handle.props.theme
		let systemDark = false

		handle.queueTask(() => {
			let query = window.matchMedia('(prefers-color-scheme: dark)')
			systemDark = query.matches
			query.addEventListener(
				'change',
				(event) => {
					systemDark = event.matches
					handle.update()
				},
				{ signal: handle.signal },
			)
			handle.update()
		})

		let effective = (): Theme => theme ?? (systemDark ? 'dark' : 'light')

		return () => {
			let dark = effective() === 'dark'
			return (
				<form
					id={THEME_FORM_ID}
					method="post"
					action={handle.props.action}
					mix={[
						formStyle,
						on('submit', (event) => {
							event.preventDefault()
							theme = dark ? 'light' : 'dark'
							document.documentElement.dataset.theme = theme
							document.cookie = `theme=${theme}; Path=/; Max-Age=31536000; SameSite=Lax${
								location.protocol === 'https:' ? '; Secure' : ''
							}`
							handle.update()
						}),
					]}
				>
					<input type="hidden" name="returnTo" value={handle.props.returnTo} />
					<button
						type="submit"
						name="theme"
						value={dark ? 'light' : 'dark'}
						aria-pressed={dark ? 'true' : 'false'}
						aria-label="Night mode"
						title={dark ? 'Switch to day' : 'Switch to night'}
					>
						<Doodle name={dark ? 'sun' : 'moon'} ink={false} />
					</button>
				</form>
			)
		}
	},
)

const formStyle = css({
	display: 'contents',
	'& button': {
		display: 'grid',
		placeItems: 'center',
		width: '44px',
		height: '44px',
		padding: 0,
		background: 'none',
		border: 0,
		cursor: 'pointer',
	},
	'& svg': { width: '24px', height: '24px' },
	'& button:hover svg': { color: 'var(--accent)' },
})
