import { clientEntry, css, on } from 'remix/ui'
import type { Handle, RemixElement } from 'remix/ui'

import { getTheme, THEME_EVENT, toggleTheme, type Theme } from './theme.ts'

/** Day (ink on paper) ↔ night (chalk-white ink on black paper). Icons are drawn on the server. */
export const ThemeToggle = clientEntry(
	import.meta.url,
	function ThemeToggle(handle: Handle<{ sun: RemixElement; moon: RemixElement }>) {
		let theme: Theme | undefined

		handle.queueTask(() => {
			theme = getTheme()
			document.addEventListener(
				THEME_EVENT,
				() => {
					theme = getTheme()
					handle.update()
				},
				{ signal: handle.signal },
			)
			handle.update()
		})

		return () => {
			let label = theme === 'dark' ? 'Switch to day' : 'Switch to night'
			return (
				<button
					type="button"
					aria-label={theme ? label : 'Toggle day and night'}
					title={theme ? label : 'Toggle day and night'}
					mix={[toggleStyle, on('click', () => toggleTheme())]}
				>
					<span className="icon sun">{handle.props.sun}</span>
					<span className="icon moon">{handle.props.moon}</span>
				</button>
			)
		}
	},
)

const toggleStyle = css({
	display: 'grid',
	placeItems: 'center',
	width: '42px',
	height: '42px',
	padding: 0,
	background: 'transparent',
	color: 'var(--ink)',
	border: 0,
	transition: 'transform 200ms ease',
	'&:hover': { transform: 'rotate(-14deg) scale(1.08)' },
	'& .icon': { gridArea: '1 / 1', width: '34px', height: '34px' },
	'& .icon svg': { width: '100%', height: '100%' },
	'& .moon': { display: 'none' },
	':root[data-theme="dark"] & .sun': { display: 'none' },
	':root[data-theme="dark"] & .moon': { display: 'block' },
})
