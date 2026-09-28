import roughModule from 'roughjs'
import type { Handle } from 'remix/ui'

/**
 * Server-side pen-and-ink drawing helpers built on roughjs. Everything is
 * generated with fixed seeds, so the same markup comes out on every request.
 */

// roughjs ships CommonJS; under Node's ESM interop its API sits on `.default`.
type Rough = (typeof import('roughjs'))['default']
const rough: Rough =
	(roughModule as unknown as { default?: Rough }).default ?? (roughModule as unknown as Rough)
const gen = rough.generator()

type Options = NonNullable<Parameters<typeof gen.rectangle>[4]>
type Drawable = ReturnType<typeof gen.rectangle>

/** One SVG path: a pen `line`, a `hatch` stroke fill, or a solid paper `fill`. */
export interface Ink {
	d: string
	kind: 'line' | 'hatch' | 'fill'
	width?: number
}

const HATCH = '#hatch'
const PAPER = '#paper'

const round = (d: string) =>
	d.replace(/-?\d+\.\d+/g, (n) => String(Math.round(Number(n) * 10) / 10))

function toInk(drawable: Drawable, width?: number): Ink[] {
	return gen.toPaths(drawable).map((path: { d: string; stroke: string; fill?: string }) => {
		let kind: Ink['kind'] = path.stroke === HATCH ? 'hatch' : path.fill === PAPER ? 'fill' : 'line'
		return { d: round(path.d), kind, width: kind === 'line' ? width : undefined }
	})
}

export interface Pen {
	/** Seeds start from this number and count up, so output is stable. */
	seed: number
	roughness?: number
	bowing?: number
}

/** A drawing session: every call gets the next seed. */
export function createPen(base: Pen) {
	let seed = base.seed
	let defaults: Options = {
		roughness: base.roughness ?? 1.2,
		bowing: base.bowing ?? 1,
		stroke: '#ink',
		strokeWidth: 1.6,
	}
	let opts = (
		o: Partial<Options> & { hatch?: boolean | number; paper?: boolean; thin?: boolean } = {},
	) => {
		let { hatch, paper, thin, ...rest } = o
		let result: Options = { ...defaults, seed: seed++, ...rest }
		if (thin) result = { ...result, strokeWidth: 1.1, disableMultiStroke: true, roughness: 0.8 }
		if (hatch) {
			result = {
				...result,
				fill: HATCH,
				fillStyle: 'hachure',
				hachureGap: typeof hatch === 'number' ? hatch : 7,
				hachureAngle: -41,
				fillWeight: 1,
			}
		} else if (paper) {
			result = { ...result, fill: PAPER, fillStyle: 'solid' }
		}
		return result
	}
	type O = Parameters<typeof opts>[0]
	return {
		rect: (x: number, y: number, w: number, h: number, o?: O) =>
			toInk(gen.rectangle(x, y, w, h, opts(o)), o?.strokeWidth),
		line: (x1: number, y1: number, x2: number, y2: number, o?: O) =>
			toInk(gen.line(x1, y1, x2, y2, opts(o)), o?.strokeWidth),
		circle: (x: number, y: number, d: number, o?: O) =>
			toInk(gen.circle(x, y, d, opts(o)), o?.strokeWidth),
		ellipse: (x: number, y: number, w: number, h: number, o?: O) =>
			toInk(gen.ellipse(x, y, w, h, opts(o)), o?.strokeWidth),
		arc: (x: number, y: number, w: number, h: number, start: number, stop: number, o?: O) =>
			toInk(gen.arc(x, y, w, h, start, stop, false, opts(o)), o?.strokeWidth),
		poly: (points: Array<[number, number]>, o?: O) =>
			toInk(gen.polygon(points, opts(o)), o?.strokeWidth),
		lines: (points: Array<[number, number]>, o?: O) =>
			toInk(gen.linearPath(points, opts(o)), o?.strokeWidth),
		curve: (points: Array<[number, number]>, o?: O) =>
			toInk(gen.curve(points, opts(o)), o?.strokeWidth),
		path: (d: string, o?: O) => toInk(gen.path(d, opts(o)), o?.strokeWidth),
	}
}

export type PenApi = ReturnType<typeof createPen>

/** Renders ink paths; strokes follow `currentColor`, fills follow the paper. */
export function InkPaths(handle: Handle<{ ink: Ink[] }>) {
	return () =>
		handle.props.ink.map((ink, i) =>
			ink.kind === 'fill' ? (
				<path d={ink.d} fill="var(--paper)" stroke="none" className="paper" />
			) : (
				<path
					d={ink.d}
					style={{ '--i': i % 12 }}
					fill="none"
					stroke="currentColor"
					strokeWidth={ink.kind === 'hatch' ? 0.9 : (ink.width ?? 1.6)}
					strokeLinecap="round"
					className={ink.kind === 'hatch' ? 'hatch' : undefined}
				/>
			),
		)
}

// ─── Sketchy frames for CSS border-image ───────────────────────────────────

function frameSvg(seed: number, color: string) {
	let pen = createPen({ seed, roughness: 1.6, bowing: 0.8 })
	let ink = pen.rect(6, 6, 108, 108, { strokeWidth: 1.8 })
	let paths = ink.map(
		(i) =>
			`<path d="${i.d}" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round"/>`,
	)
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">${paths.join('')}</svg>`
}

const dataUri = (svg: string) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`

/** CSS custom properties with sketchy frame images for both themes. */
export const frameCss = (() => {
	let light = '#161616'
	let dark = '#ecebe6'
	return [
		`:root{--frame-a:${dataUri(frameSvg(11, light))};--frame-b:${dataUri(frameSvg(29, light))}}`,
		`:root[data-theme='dark']{--frame-a:${dataUri(frameSvg(11, dark))};--frame-b:${dataUri(frameSvg(29, dark))}}`,
	].join('')
})()
