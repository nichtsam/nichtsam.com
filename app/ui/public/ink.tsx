import { clientEntry } from 'remix/ui'
import type { Handle } from 'remix/ui'

import { drawShape, type ShapeName } from './pencil.ts'

/** Dispatch on `document` after revealing or swapping content, to draw it in. */
export const REFRESH_EVENT = 'pencil:refresh'

const SVG_NS = 'http://www.w3.org/2000/svg'

declare global {
	interface Window {
		/** Set once the pencil runs, so the inline fallback in the document stands down. */
		__pencil?: boolean
	}
}

/**
 * Draws the page in as it scrolls into view and erases it as it leaves.
 *
 * - `[data-ink]` text is written in left to right (a clip-path wipe).
 * - `svg[data-ink]` strokes are drawn with dash offsets.
 * - `svg[data-sketch]` frames are redrawn at their real size whenever it changes.
 *
 * The CSS in `site.css` owns the visual states; this only measures and toggles `.in`.
 */
export const Ink = clientEntry(import.meta.url, function Ink(handle: Handle) {
	handle.queueTask(() => {
		window.__pencil = true
		let signal = handle.signal
		let queued = false

		let resize = new ResizeObserver((entries) => {
			for (let entry of entries) fit(entry.target as SVGSVGElement)
			schedule()
		})
		signal.addEventListener('abort', () => resize.disconnect())

		function schedule() {
			if (queued) return
			queued = true
			requestAnimationFrame(() => {
				queued = false
				scan()
			})
		}

		function scan() {
			let margin = window.innerHeight * 0.05
			for (let node of document.querySelectorAll<HTMLElement | SVGElement>('[data-ink]')) {
				if (node.closest('[data-erasing]')) continue
				if (node instanceof SVGSVGElement && !prepare(node)) continue
				let rect = node.getBoundingClientRect()
				let visible =
					rect.width > 0 && rect.bottom > margin && rect.top < window.innerHeight - margin
				node.classList.toggle('in', visible)
			}
		}

		/** Measures strokes (and fits frames) so they can be drawn; false while not laid out. */
		function prepare(svg: SVGSVGElement) {
			if (svg.dataset.sketch) {
				if (!svg.dataset.observed) {
					svg.dataset.observed = ''
					resize.observe(svg)
				}
				if (!fit(svg)) return false
			}
			if (!svg.classList.contains('ready')) measure(svg)
			return true
		}

		function measure(svg: SVGSVGElement) {
			svg.querySelectorAll('path').forEach((path, i) => {
				let length = Math.ceil(path.getTotalLength()) + 2
				path.style.setProperty('--len', `${length}px`)
				path.style.setProperty('--i', String(Math.min(i, 36)))
			})
			svg.classList.add('ready')
		}

		/** Redraws a frame at its real size, with the seed the server used. */
		function fit(svg: SVGSVGElement) {
			let width = Math.round(svg.clientWidth)
			let height = Math.round(svg.clientHeight)
			if (!width || !height) return false
			let size = `${width}x${height}`
			// Checked on the paths too: a client navigation may swap them back to the server's guess.
			if (svg.dataset.fit === size && svg.firstElementChild?.getAttribute('data-fit') === size) {
				return true
			}
			let strokes = drawShape(
				svg.dataset.sketch as ShapeName,
				Number(svg.dataset.seed),
				width,
				height,
			)
			let paths = strokes.map((stroke) => {
				let path = document.createElementNS(SVG_NS, 'path')
				path.setAttribute('d', stroke.d)
				path.setAttribute('stroke-width', String(stroke.width))
				if (stroke.hatch) path.setAttribute('class', 'hatch')
				return path
			})
			paths[0]?.setAttribute('data-fit', size)
			svg.replaceChildren(...paths)
			svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
			svg.dataset.fit = size
			measure(svg)
			return true
		}

		// Client navigations replace parts of the page; draw whatever arrives.
		let mutations = new MutationObserver(schedule)
		mutations.observe(document.body, {
			subtree: true,
			childList: true,
			attributes: true,
			attributeFilter: ['class', 'hidden', 'data-current'],
		})
		signal.addEventListener('abort', () => mutations.disconnect())
		window.addEventListener('scroll', schedule, { passive: true, signal })
		window.addEventListener('resize', schedule, { signal })
		document.addEventListener(REFRESH_EVENT, schedule, { signal })
		scan()
	})

	return () => <span hidden />
})
