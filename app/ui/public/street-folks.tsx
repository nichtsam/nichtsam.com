import { clientEntry } from 'remix/ui'
import type { Handle } from 'remix/ui'

import { prefersReducedMotion } from './theme.ts'

/**
 * Three little characters strolling along the sidewalk of the street scene.
 * Click (or tap) the street and they jump. Drawn in the scene's coordinates
 * (1600×720) on an overlay that sits exactly on top of the scene SVG.
 */

type Kind = 'sam' | 'bean' | 'cat'

interface Folk {
	kind: Kind
	x: number
	dir: 1 | -1
	y: number
	vy: number
	phase: number
}

const FEET = 633
const MIN_X = 24
const MAX_X = 1576
const SPEED = 52
const GRAVITY = 900
const JUMP = 300

export const JUMP_EVENT = 'street:jump'

export const StreetFolks = clientEntry(
	import.meta.url,
	function StreetFolks(handle: Handle<{ sceneId: string }>) {
		let folks: Folk[] = [
			{ kind: 'sam', x: 470, dir: 1, y: 0, vy: 0, phase: 0 },
			{ kind: 'bean', x: 436, dir: 1, y: 0, vy: 0, phase: 1.7 },
			{ kind: 'cat', x: 400, dir: 1, y: 0, vy: 0, phase: 3.1 },
		]

		function jump() {
			folks.forEach((folk, i) => {
				window.setTimeout(() => {
					if (folk.y === 0) folk.vy = -JUMP * (0.9 + Math.random() * 0.2)
				}, i * 90)
			})
		}

		handle.queueTask(() => {
			let scene = document.getElementById(handle.props.sceneId)
			if (!scene) return
			let signal = handle.signal

			scene.addEventListener(
				'pointerdown',
				(event) => {
					let target = event.target as Element
					if (target.closest('a, button, [data-win], [data-house], .window')) return
					jump()
				},
				{ signal },
			)
			scene.addEventListener(JUMP_EVENT, jump, { signal })

			if (prefersReducedMotion()) return

			let last = performance.now()
			let frame = 0
			let step = (now: number) => {
				let dt = Math.min(0.05, (now - last) / 1000)
				last = now
				if (!scene!.classList.contains('is-paused') && !document.hidden) {
					for (let folk of folks) {
						folk.x += folk.dir * SPEED * dt
						if (folk.x > MAX_X) folk.dir = -1
						if (folk.x < MIN_X) folk.dir = 1
						folk.phase += dt * 9
						if (folk.y < 0 || folk.vy !== 0) {
							folk.vy += GRAVITY * dt
							folk.y = Math.min(0, folk.y + folk.vy * dt)
							if (folk.y === 0) folk.vy = 0
						}
					}
					handle.update()
				}
				frame = requestAnimationFrame(step)
			}
			frame = requestAnimationFrame(step)
			signal.addEventListener('abort', () => cancelAnimationFrame(frame))
		})

		return () => (
			<svg className="folks" viewBox="0 0 1600 720" aria-hidden="true" focusable="false">
				{folks.map((folk) => {
					let bob = folk.y === 0 ? Math.abs(Math.sin(folk.phase)) * -2 : 0
					let swing = folk.y === 0 ? Math.sin(folk.phase) * 3 : 2
					return (
						<g
							key={folk.kind}
							transform={`translate(${folk.x.toFixed(1)} ${(FEET + folk.y + bob).toFixed(1)}) scale(${folk.dir} 1)`}
						>
							<Character kind={folk.kind} swing={swing} />
						</g>
					)
				})}
			</svg>
		)
	},
)

function Character(handle: Handle<{ kind: Kind; swing: number }>) {
	return () => {
		let { kind, swing } = handle.props
		let ink = {
			stroke: 'currentColor',
			strokeWidth: 2.2,
			strokeLinecap: 'round',
			strokeLinejoin: 'round',
		} as const
		let legs = <path {...ink} fill="none" d={`M-4 -1 L ${-4 - swing} 6 M4 -1 L ${4 + swing} 6`} />
		switch (kind) {
			case 'sam':
				return (
					<g>
						{legs}
						<path
							{...ink}
							fill="var(--paper)"
							d="M-11 0 C -13 -18, -10 -35, 0 -35 C 10 -35, 13 -18, 11 0 Z"
						/>
						<path
							{...ink}
							fill="none"
							d="M-9 -30 L -6 -40 L -2 -33 L 1 -42 L 4 -33 L 8 -39 L 9 -30"
						/>
						<circle cx={-1} cy={-23} r={1.8} fill="currentColor" />
						<circle cx={6} cy={-23} r={1.8} fill="currentColor" />
						<path {...ink} fill="none" strokeWidth={1.6} d="M0 -16 C 2 -14, 5 -14, 6 -16" />
					</g>
				)
			case 'bean':
				return (
					<g>
						{legs}
						<path {...ink} fill="none" d="M1 -26 C 1 -31, 3 -34, 6 -35" />
						<path
							{...ink}
							fill="var(--paper)"
							strokeWidth={1.6}
							d="M6 -35 C 10 -39, 14 -36, 12 -33 C 10 -31, 7 -32, 6 -35 Z"
						/>
						<ellipse {...ink} cx={0} cy={-13} rx={10} ry={13} fill="#f6c945" />
						<circle cx={2} cy={-15} r={1.6} fill="#161616" />
						<circle cx={7} cy={-15} r={1.6} fill="#161616" />
					</g>
				)
			case 'cat':
				return (
					<g>
						{legs}
						<path {...ink} fill="none" d="M-10 -8 C -18 -10, -18 -22, -12 -24" />
						<path
							{...ink}
							fill="currentColor"
							d="M-10 0 C -12 -12, -10 -24, -8 -26 L -5 -34 L -1 -27 C 2 -28, 5 -28, 7 -27 L 10 -34 L 12 -25 C 13 -16, 12 -6, 10 0 Z"
						/>
						<circle cx={1} cy={-19} r={2.2} fill="var(--paper)" />
						<circle cx={8} cy={-19} r={2.2} fill="var(--paper)" />
					</g>
				)
		}
	}
}
