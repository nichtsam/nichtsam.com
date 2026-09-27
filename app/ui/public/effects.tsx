import { clientEntry, css } from 'remix/ui'
import type { Handle } from 'remix/ui'

import { prefersReducedMotion } from './theme.ts'

const SHAPES = [
	// star
	'M20 4 L 24 15 L 36 16 L 27 24 L 30 36 L 20 29 L 10 36 L 13 24 L 4 16 L 16 15 Z',
	// spiral
	'M20 20 C 22 17, 26 19, 25 23 C 24 28, 16 28, 14 22 C 12 15, 22 10, 28 14 C 35 19, 32 32, 22 34',
	// burst
	'M20 3 V 11 M20 29 V 37 M3 20 H 11 M29 20 H 37 M8 8 L 13 13 M27 27 L 32 32 M32 8 L 27 13 M8 32 L 13 27',
	// heart
	'M20 33 C 8 24, 2 17, 4 10 C 6 3, 16 2, 20 10 C 23 2, 34 2, 36 10 C 38 18, 30 25, 20 33 Z',
]
const COLORS = ['var(--pen-red)', 'var(--pen-blue)', 'var(--pen-green)', 'var(--ink)']

interface Mark {
	id: number
	x: number
	y: number
	shape: string
	color: string
	rotate: number
}

/** Leaves a tiny doodle wherever you click. */
export const Effects = clientEntry(import.meta.url, function Effects(handle: Handle) {
	let marks: Mark[] = []
	let nextId = 0

	handle.queueTask(() => {
		window.addEventListener(
			'pointerdown',
			(event) => {
				if (prefersReducedMotion() || event.button !== 0) return
				let target = event.target as HTMLElement | null
				if (target?.closest('[data-no-doodle]')) return
				let id = nextId++
				marks.push({
					id,
					x: event.clientX,
					y: event.clientY,
					shape: SHAPES[id % SHAPES.length]!,
					color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
					rotate: Math.round(Math.random() * 40 - 20),
				})
				handle.update()
				window.setTimeout(() => {
					marks = marks.filter((mark) => mark.id !== id)
					handle.update()
				}, 900)
			},
			{ signal: handle.signal },
		)
	})

	return () => (
		<div aria-hidden="true" mix={effectsStyle}>
			{marks.map((mark) => (
				<svg
					key={mark.id}
					viewBox="0 0 40 40"
					style={{
						left: `${mark.x}px`,
						top: `${mark.y}px`,
						color: mark.color,
						transform: `translate(-50%, -50%) rotate(${mark.rotate}deg)`,
					}}
				>
					<path
						d={mark.shape}
						pathLength={1}
						fill="none"
						stroke="currentColor"
						strokeWidth={2.4}
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			))}
		</div>
	)
})

const effectsStyle = css({
	position: 'fixed',
	inset: 0,
	pointerEvents: 'none',
	zIndex: 95,
	'& svg': {
		position: 'absolute',
		width: '34px',
		height: '34px',
		animation: 'mark-fade 900ms ease forwards',
	},
	'& path': {
		strokeDasharray: 1,
		strokeDashoffset: 1,
		animation: 'mark-draw 300ms ease-out forwards',
	},
	'@keyframes mark-draw': {
		to: { strokeDashoffset: 0 },
	},
	'@keyframes mark-fade': {
		'0%, 60%': { opacity: 1 },
		to: { opacity: 0 },
	},
})
