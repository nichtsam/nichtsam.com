import { clientEntry } from 'remix/ui'
import type { Handle } from 'remix/ui'

import { prefersReducedMotion } from './theme.ts'

/**
 * Brings the server-drawn street scene to life without re-rendering it:
 * switch window lights, knock on Sam's door, read the real time off the
 * clock tower, follow the pointer with a label, and a gentle parallax.
 */
export const SceneControls = clientEntry(
	import.meta.url,
	function SceneControls(handle: Handle<{ sceneId: string; lines: string[] }>) {
		handle.queueTask(() => {
			let scene = document.getElementById(handle.props.sceneId)
			if (!scene) return
			let signal = handle.signal
			let svg = scene.querySelector('svg')!
			let tip = scene.querySelector<HTMLElement>('[data-tip]')
			let bubble = scene.querySelector<SVGGElement>('[data-bubble]')
			let says = scene.querySelector<SVGTextElement>('[data-says]')
			let line = 0

			// Lights: a window is lit at night unless switched off, or any time it's switched on.
			scene.addEventListener(
				'click',
				(event) => {
					let target = event.target as Element
					// The pen outline sits on top of the window pane, so accept clicks on either.
					let win =
						target.closest('[data-win]') ?? target.closest('.window')?.querySelector('[data-win]')
					if (!win) return
					event.preventDefault()
					event.stopPropagation()
					let lit = getComputedStyle(win).fillOpacity !== '0'
					win.classList.toggle('on', !lit)
					win.classList.toggle('off', lit)
				},
				{ signal, capture: true },
			)

			// Knock on Sam's door.
			let knock = () => {
				if (!bubble || !says) return
				if (bubble.classList.contains('is-open')) line = (line + 1) % handle.props.lines.length
				says.textContent = handle.props.lines[line]!
				bubble.classList.remove('is-open')
				void bubble.getBoundingClientRect()
				bubble.classList.add('is-open')
			}
			let house = scene.querySelector('[data-house]')
			house?.addEventListener('click', knock, { signal })
			house?.addEventListener(
				'keydown',
				(event) => {
					let key = (event as KeyboardEvent).key
					if (key === 'Enter' || key === ' ') {
						event.preventDefault()
						knock()
					}
				},
				{ signal },
			)

			// The clock tower shows the visitor's time.
			let hour = scene.querySelector('#clock-hour')
			let minute = scene.querySelector('#clock-minute')
			let tick = () => {
				let now = new Date()
				let m = now.getMinutes() + now.getSeconds() / 60
				let h = (now.getHours() % 12) + m / 60
				hour?.setAttribute('transform', `rotate(${h * 30} 680 246)`)
				minute?.setAttribute('transform', `rotate(${m * 6} 680 246)`)
			}
			tick()
			let clock = window.setInterval(tick, 20_000)
			signal.addEventListener('abort', () => window.clearInterval(clock))

			// Pointer label + parallax.
			let frame = 0
			let pending: PointerEvent | null = null
			let apply = () => {
				frame = 0
				if (!pending) return
				let rect = scene!.getBoundingClientRect()
				let px = ((pending.clientX - rect.left) / rect.width) * 2 - 1
				if (!prefersReducedMotion()) scene!.style.setProperty('--px', px.toFixed(3))
				let target = (pending.target as Element).closest?.('[data-label]')
				if (tip) {
					if (target) {
						tip.textContent = target.getAttribute('data-label')
						tip.style.setProperty('--x', `${pending.clientX - rect.left}px`)
						tip.style.setProperty('--y', `${pending.clientY - rect.top}px`)
						tip.classList.add('is-on')
					} else {
						tip.classList.remove('is-on')
					}
				}
			}
			scene.addEventListener(
				'pointermove',
				(event) => {
					pending = event
					if (!frame) frame = requestAnimationFrame(apply)
				},
				{ signal, passive: true },
			)
			scene.addEventListener('pointerleave', () => tip?.classList.remove('is-on'), { signal })
			signal.addEventListener('abort', () => cancelAnimationFrame(frame))

			// On narrow screens the panorama scrolls; start on the bookshop.
			if (scene.scrollWidth > scene.clientWidth) {
				scene.scrollLeft = (svg.clientWidth - scene.clientWidth) * 0.22
			}
		})

		return () => null
	},
)
