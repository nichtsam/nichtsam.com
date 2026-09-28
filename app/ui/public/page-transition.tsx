import { clientEntry, css, navigate, ref } from 'remix/ui'
import type { Handle } from 'remix/ui'

import { REFRESH_EVENT } from './ink.tsx'

const SVG_NS = 'http://www.w3.org/2000/svg'

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const ease = (k: number) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2)

/**
 * Page changes: one continuous pen line zigzags back and forth until the
 * screen is scribbled over, the next page is swapped in underneath, and the
 * line is wiped away left to right.
 *
 * It only wraps Remix's own client navigation (`navigate`). Links stay plain
 * links; without JavaScript, the Navigation API, or with reduced motion,
 * pages change the ordinary way.
 */
export const PageTransition = clientEntry(import.meta.url, function PageTransition(handle: Handle) {
	let layer: SVGSVGElement | undefined
	let busy = false

	handle.queueTask(() => {
		document.addEventListener('click', onClick, { signal: handle.signal })
	})

	function onClick(event: MouseEvent) {
		if (busy) return
		let href = transitionHref(event)
		if (!href) return
		event.preventDefault()
		void go(href)
	}

	async function go(href: string) {
		if (!layer) return
		busy = true
		layer.dataset.active = ''
		let scribble = new Scribble(layer)
		try {
			await scribble.cover()
			try {
				await navigate(href)
			} catch {
				window.location.assign(href)
				return
			}
			// The top of the new page, unless the link points into it.
			if (!new URL(href).hash) window.scrollTo(0, 0)
			document.getElementById('main')?.focus({ preventScroll: true })
			document.dispatchEvent(new Event(REFRESH_EVENT))
			await wait(70)
			await scribble.uncover()
		} finally {
			scribble.clear()
			delete layer.dataset.active
			busy = false
		}
	}

	return () => (
		<svg
			aria-hidden="true"
			focusable="false"
			data-rmx-key="page-transition"
			data-rmx-preserve-dom
			mix={[layerStyle, ref((node) => (layer = node))]}
		/>
	)
})

/** The destination when a click should get the transition, else nothing. */
function transitionHref(event: MouseEvent) {
	if (event.defaultPrevented || event.button !== 0) return
	if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
	let anchor = (event.target as Element | null)?.closest?.('a[href]')
	if (!(anchor instanceof HTMLAnchorElement)) return
	if (anchor.target && anchor.target !== '_self') return
	if (anchor.hasAttribute('download') || anchor.hasAttribute('data-rmx-document')) return
	if (!('navigation' in window)) return
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
	let url = new URL(anchor.href, window.location.href)
	if (url.origin !== window.location.origin) return
	// Links within the same page (fragments) scroll; they don't change pages.
	if (url.pathname === window.location.pathname && url.search === window.location.search) return
	return url.href
}

function wait(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

function frames(ms: number, step: (k: number) => void) {
	return new Promise<void>((resolve) => {
		let start = performance.now()
		let tick = (now: number) => {
			let k = clamp((now - start) / ms, 0, 1)
			step(k)
			if (k < 1) requestAnimationFrame(tick)
			else resolve()
		}
		requestAnimationFrame(tick)
	})
}

interface Piece {
	path: SVGPathElement
	start: number
	length: number
	x: number
}

class Scribble {
	#layer: SVGSVGElement
	#pieces: Piece[] = []
	#total = 0
	#fill: SVGRectElement
	#width: number
	#height: number

	constructor(layer: SVGSVGElement) {
		this.#layer = layer
		// The layer's own box: `innerWidth` includes the scrollbar and would letterbox the drawing.
		let box = layer.getBoundingClientRect()
		this.#width = box.width
		this.#height = box.height
		layer.setAttribute('viewBox', `0 0 ${this.#width} ${this.#height}`)
		layer.setAttribute('preserveAspectRatio', 'none')
		layer.replaceChildren()
		// Catches the last pinholes once the page is scribbled over.
		this.#fill = document.createElementNS(SVG_NS, 'rect')
		for (let [name, value] of Object.entries({
			x: -20,
			y: -20,
			width: this.#width + 40,
			height: this.#height + 40,
			fill: 'currentColor',
			opacity: 0,
		})) {
			this.#fill.setAttribute(name, String(value))
		}
		layer.append(this.#fill)
		this.#build()
	}

	/** Three passes, each with its own slant, thicker as it goes, joined into one line. */
	#points() {
		let w = this.#width
		let h = this.#height
		let points: Array<[number, number, number]> = []
		let passes = [
			{ slant: 0.75, pitch: 9, dir: 1 },
			{ slant: 0.5, pitch: 8, dir: -1 },
			{ slant: 1, pitch: 7.5, dir: 1 },
		]
		passes.forEach(({ slant, pitch, dir }, pass) => {
			let reach = h * slant
			let from = dir > 0 ? -reach - 30 : w + 30
			let to = dir > 0 ? w + 30 : -reach - 30
			let bottom = pass % 2 === 0
			for (let x = from; dir > 0 ? x < to : x > to; x += dir * (pitch + Math.random() * pitch)) {
				if (bottom) points.push([x, h + 30 + Math.random() * 20, pass])
				else
					points.push([x + reach * (0.82 + Math.random() * 0.36), -30 - Math.random() * 20, pass])
				bottom = !bottom
			}
		})
		return points
	}

	#build() {
		let points = this.#points()
		let h = this.#height
		for (let i = 0; i < points.length - 1;) {
			let n = 2 + Math.floor(Math.random() * 4)
			let segment = points.slice(i, i + n + 1)
			i += n
			let pass = segment[0]![2]
			let path = document.createElementNS(SVG_NS, 'path')
			path.setAttribute(
				'd',
				'M' + segment.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L'),
			)
			path.setAttribute(
				'stroke-width',
				(3 + pass * 1.5 + Math.random() * Math.random() * 8).toFixed(1),
			)
			this.#layer.append(path)
			let length = path.getTotalLength()
			path.style.strokeDasharray = `${length} ${length + 1}`
			path.style.strokeDashoffset = `${length}`
			// Where along the screen this piece sits, for wiping left to right.
			let xs = segment.map(([x, y]) => x + (y < 0 ? -h * 0.4 : 0))
			this.#pieces.push({
				path,
				start: this.#total,
				length,
				x: (Math.min(...xs) + Math.max(...xs)) / 2,
			})
			this.#total += length
		}
	}

	cover() {
		return frames(640, (k) => {
			let at = this.#total * ease(k)
			for (let { path, start, length } of this.#pieces) {
				path.style.strokeDashoffset = `${length - clamp(at - start, 0, length)}`
			}
			this.#fill.setAttribute('opacity', String(clamp((k - 0.85) / 0.15, 0, 1)))
		})
	}

	uncover() {
		let w = this.#width
		let h = this.#height
		let span = w + h * 1.2
		return frames(460, (k) => {
			let front = -h * 0.6 + span * ease(k) * 1.15
			for (let { path, length, x } of this.#pieces) {
				let erased = clamp((front - x) / (w * 0.18), 0, 1)
				path.style.strokeDashoffset = `${-length * erased}`
			}
			this.#fill.setAttribute('opacity', String(clamp(1 - k / 0.12, 0, 1)))
		})
	}

	clear() {
		this.#layer.replaceChildren()
	}
}

const layerStyle = css({
	position: 'fixed',
	inset: 0,
	zIndex: 100,
	width: '100%',
	height: '100%',
	color: 'var(--ink)',
	pointerEvents: 'none',
	'&[data-active]': { pointerEvents: 'auto' },
	'& path': {
		fill: 'none',
		stroke: 'currentColor',
		strokeLinecap: 'round',
		strokeLinejoin: 'round',
	},
})
