import { clientEntry, css, on } from 'remix/ui'
import type { Handle } from 'remix/ui'

import { Moon, Sun } from './doodles.tsx'
import { getTheme, THEME_EVENT, toggleTheme, type Theme } from './theme.ts'

export const ThemeToggle = clientEntry(import.meta.url, function ThemeToggle(handle: Handle) {
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
		let label = theme === 'dark' ? 'Back to the notebook' : 'Switch to the chalkboard'
		return (
			<button
				type="button"
				aria-label={theme ? label : 'Toggle color theme'}
				title={theme ? label : 'Toggle color theme'}
				mix={[toggleStyle, on('click', () => toggleTheme())]}
			>
				<Sun className="icon sun boil" />
				<Moon className="icon moon boil" />
			</button>
		)
	}
})

const toggleStyle = css({
	display: 'grid',
	placeItems: 'center',
	width: '46px',
	height: '46px',
	padding: 0,
	background: 'transparent',
	color: 'var(--ink)',
	border: '2px solid var(--ink)',
	borderRadius: '50% 45% 55% 48% / 48% 55% 45% 50%',
	transition: 'transform 200ms ease',
	'&:hover': {
		transform: 'rotate(-12deg) scale(1.06)',
		background: 'var(--hl-yellow)',
	},
	'& .icon': {
		gridArea: '1 / 1',
		width: '28px',
		height: '28px',
	},
	'& .moon': { display: 'none' },
	':root[data-theme="dark"] & .sun': { display: 'none' },
	':root[data-theme="dark"] & .moon': { display: 'block' },
})
