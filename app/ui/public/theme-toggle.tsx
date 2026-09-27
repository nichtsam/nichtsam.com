import { clientEntry, css, on } from 'remix/ui'
import type { Handle } from 'remix/ui'

import { PixelArt } from './pixel.tsx'
import { icons } from './sprites.ts'
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
		let next = theme === 'dark' ? 'light' : 'dark'
		return (
			<button
				type="button"
				aria-label={theme ? `Switch to ${next} mode` : 'Toggle color theme'}
				title={theme ? `Switch to ${next} mode` : 'Toggle color theme'}
				mix={[toggleStyle, on('click', () => toggleTheme())]}
			>
				<span className="icon sun">
					<PixelArt sprite={icons.sun!} />
				</span>
				<span className="icon moon">
					<PixelArt sprite={icons.moon!} />
				</span>
			</button>
		)
	}
})

const toggleStyle = css({
	position: 'relative',
	display: 'grid',
	placeItems: 'center',
	width: '44px',
	height: '44px',
	padding: 0,
	background: 'var(--surface)',
	color: 'var(--ink)',
	border: 'var(--px) solid var(--line)',
	boxShadow: '0 var(--px) 0 var(--shadow)',
	transition: 'transform 80ms steps(2), box-shadow 80ms steps(2)',
	'&:hover': {
		background: 'var(--gold)',
		color: '#22203a',
	},
	'&:active': {
		transform: 'translateY(var(--px))',
		boxShadow: '0 0 0 var(--shadow)',
	},
	'& .icon': {
		gridArea: '1 / 1',
		width: '22px',
	},
	'& .icon svg': { width: '100%', height: 'auto' },
	'& .moon': { display: 'none' },
	':root[data-theme="dark"] & .sun': { display: 'none' },
	':root[data-theme="dark"] & .moon': { display: 'block' },
})
