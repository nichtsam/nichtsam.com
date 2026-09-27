import { clientEntry, css } from 'remix/ui'
import type { Handle } from 'remix/ui'

import { blip } from './chiptune.ts'
import { prefersReducedMotion } from './theme.ts'

const KONAMI = [
	'arrowup',
	'arrowup',
	'arrowdown',
	'arrowdown',
	'arrowleft',
	'arrowright',
	'arrowleft',
	'arrowright',
	'b',
	'a',
]

const COLORS = ['#ff4f6d', '#ffbe2e', '#2fb36b', '#2e8ff0', '#b98bff']

interface Burst {
	id: number
	x: number
	y: number
}

/**
 * Site-wide flourishes: pixel sparkles on click, and a konami code that toggles
 * a CRT scanline mode.
 */
export const Effects = clientEntry(import.meta.url, function Effects(handle: Handle) {
	let bursts: Burst[] = []
	let nextId = 0
	let progress = 0
	let toast: string | null = null
	let toastTimer: number | undefined

	handle.queueTask(() => {
		try {
			if (localStorage.getItem('crt') === '1') document.documentElement.dataset.crt = ''
		} catch {}

		window.addEventListener(
			'pointerdown',
			(event) => {
				if (prefersReducedMotion() || event.button !== 0) return
				let id = nextId++
				bursts.push({ id, x: event.clientX, y: event.clientY })
				handle.update()
				window.setTimeout(() => {
					bursts = bursts.filter((burst) => burst.id !== id)
					handle.update()
				}, 500)
			},
			{ signal: handle.signal },
		)

		window.addEventListener(
			'keydown',
			(event) => {
				let key = event.key.toLowerCase()
				progress = key === KONAMI[progress] ? progress + 1 : key === KONAMI[0] ? 1 : 0
				if (progress === KONAMI.length) {
					progress = 0
					let root = document.documentElement
					let on = !('crt' in root.dataset)
					if (on) root.dataset.crt = ''
					else delete root.dataset.crt
					try {
						localStorage.setItem('crt', on ? '1' : '0')
					} catch {}
					try {
						blip(on ? 660 : 330, 0.15)
					} catch {}
					showToast(on ? '★ CRT MODE UNLOCKED ★' : 'CRT MODE OFF')
				}
			},
			{ signal: handle.signal },
		)
	})

	function showToast(text: string) {
		toast = text
		window.clearTimeout(toastTimer)
		toastTimer = window.setTimeout(() => {
			toast = null
			handle.update()
		}, 2200)
		handle.update()
	}

	return () => (
		<div aria-live="polite" mix={effectsStyle}>
			{bursts.map((burst) => (
				<div key={burst.id} className="burst" style={{ left: `${burst.x}px`, top: `${burst.y}px` }}>
					{[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
						<span
							style={{
								background: COLORS[(burst.id + i) % COLORS.length]!,
								'--angle': `${i * 45}deg`,
							}}
						/>
					))}
				</div>
			))}
			{toast && <p className="toast">{toast}</p>}
		</div>
	)
})

const effectsStyle = css({
	position: 'fixed',
	inset: 0,
	pointerEvents: 'none',
	zIndex: 95,
	'& .burst': {
		position: 'absolute',
		width: 0,
		height: 0,
	},
	'& .burst span': {
		position: 'absolute',
		left: '-3px',
		top: '-3px',
		width: '6px',
		height: '6px',
		animation: 'burst 450ms steps(5) forwards',
	},
	'& .burst span:nth-child(odd)': {
		animationName: 'burst-far',
	},
	'& .toast': {
		position: 'absolute',
		left: '50%',
		top: '24px',
		transform: 'translateX(-50%)',
		padding: '8px 16px',
		background: 'var(--gold)',
		color: '#22203a',
		border: 'var(--px) solid #22203a',
		boxShadow: 'calc(var(--px) * 2) calc(var(--px) * 2) 0 #22203a',
		fontFamily: 'var(--font-label)',
		animation: 'toast-in 300ms steps(3)',
	},
	'@keyframes burst': {
		from: { transform: 'rotate(var(--angle)) translateY(-4px)', opacity: 1 },
		to: { transform: 'rotate(var(--angle)) translateY(-18px)', opacity: 0 },
	},
	'@keyframes burst-far': {
		from: { transform: 'rotate(var(--angle)) translateY(-6px)', opacity: 1 },
		to: { transform: 'rotate(var(--angle)) translateY(-28px)', opacity: 0 },
	},
	'@keyframes toast-in': {
		from: { transform: 'translate(-50%, -150%)' },
		to: { transform: 'translate(-50%, 0)' },
	},
})
