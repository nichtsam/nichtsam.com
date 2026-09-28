/**
 * A small, seeded pencil. Everything drawn on the site comes from here, on
 * the server and in the browser alike: the same seed always gives the same
 * wobble, so a frame redrawn in the browser at its real size still looks like
 * the one the server sent.
 *
 * The line algorithm follows roughjs (a cubic bezier with jittered ends and a
 * bowed middle), trimmed down to what the site needs.
 */

export type Point = readonly [number, number]

export interface Stroke {
	d: string
	width: number
	/** Shading lines, drawn lighter than outlines. */
	hatch?: boolean
}

export interface LineOptions {
	/** How far the pencil strays from the ideal line. */
	roughness?: number
	/** How much a line sags in the middle. */
	bowing?: number
	width?: number
	/** Go over the line a second time, slightly off. */
	double?: boolean
}

export interface BoxOptions extends LineOptions {
	/** How far each side runs past the corners. */
	over?: number
	/** How many times each side is drawn. */
	passes?: number
}

const DEFAULTS = { roughness: 1.9, bowing: 1.8, width: 1.15 }
const MAX_OFFSET = 2.6
const MAX_SAG = 12

export const THIN: LineOptions = { roughness: 1.4, width: 0.9 }

/** mulberry32: tiny, fast, and good enough for wobbly lines. */
export function random(seed: number) {
	let a = seed >>> 0
	return () => {
		a = (a + 0x6d2b79f5) >>> 0
		let t = a
		t = Math.imul(t ^ (t >>> 15), t | 1)
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296
	}
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const f = (value: number) => (Math.round(value * 10) / 10).toString()

export class Pencil {
	readonly strokes: Stroke[] = []
	#rnd: () => number

	constructor(seed: number) {
		this.#rnd = random(seed)
	}

	/** A random value in [-max, max]. */
	#jitter(max: number) {
		return (this.#rnd() * 2 - 1) * max
	}

	#push(d: string, width: number, hatch?: boolean) {
		this.strokes.push(hatch ? { d, width, hatch } : { d, width })
	}

	#linePath(x1: number, y1: number, x2: number, y2: number, o: LineOptions, overlay: boolean) {
		let roughness = o.roughness ?? DEFAULTS.roughness
		let bowing = o.bowing ?? DEFAULTS.bowing
		let length = Math.hypot(x2 - x1, y2 - y1)
		let gain = length < 200 ? 1 : length > 500 ? 0.4 : -0.0016668 * length + 1.233334
		let offset = MAX_OFFSET
		if (offset * offset * 100 > length * length) offset = length / 10
		let spread = (overlay ? offset / 2 : offset) * roughness * gain
		let diverge = 0.2 + this.#rnd() * 0.2
		// Sag grows with length, but a long edge shouldn't swing into the content.
		let sag = (delta: number) => clamp((bowing * MAX_OFFSET * delta) / 200, -MAX_SAG, MAX_SAG)
		let midX = this.#jitter(sag(y2 - y1) * roughness * gain)
		let midY = this.#jitter(sag(x1 - x2) * roughness * gain)
		let j = () => this.#jitter(spread)
		return (
			`M${f(x1 + j())} ${f(y1 + j())}` +
			`C${f(midX + x1 + (x2 - x1) * diverge + j())} ${f(midY + y1 + (y2 - y1) * diverge + j())} ` +
			`${f(midX + x1 + 2 * (x2 - x1) * diverge + j())} ${f(midY + y1 + 2 * (y2 - y1) * diverge + j())} ` +
			`${f(x2 + j())} ${f(y2 + j())}`
		)
	}

	line(x1: number, y1: number, x2: number, y2: number, o: LineOptions = {}, hatch?: boolean) {
		let width = o.width ?? DEFAULTS.width
		let d = this.#linePath(x1, y1, x2, y2, o, false)
		if (o.double ?? true) d += this.#linePath(x1, y1, x2, y2, o, true)
		this.#push(d, width, hatch)
		return this
	}

	/** An open path through each point in turn, one straight stroke per segment. */
	lines(points: readonly Point[], o: LineOptions = {}) {
		for (let i = 0; i < points.length - 1; i++) {
			let [x1, y1] = points[i]!
			let [x2, y2] = points[i + 1]!
			this.line(x1, y1, x2, y2, o)
		}
		return this
	}

	polygon(points: readonly Point[], o: LineOptions = {}) {
		return this.lines([...points, points[0]!], o)
	}

	rect(x: number, y: number, w: number, h: number, o: LineOptions = {}) {
		return this.polygon(
			[
				[x, y],
				[x + w, y],
				[x + w, y + h],
				[x, y + h],
			],
			o,
		)
	}

	/** A box drawn the way people sketch one: separate strokes that run past the corners. */
	box(x: number, y: number, w: number, h: number, o: BoxOptions = {}) {
		let over = o.over ?? 8
		let lineOptions = { ...o, double: false }
		let r = () => over * (0.4 + this.#rnd() * 1.1)
		let j = () => (this.#rnd() - 0.5) * 5
		for (let pass = 0; pass < (o.passes ?? 2); pass++) {
			this.line(x - r(), y + j(), x + w + r(), y + j(), lineOptions)
			this.line(x + w + j(), y - r(), x + w + j(), y + h + r(), lineOptions)
			this.line(x + w + r(), y + h + j(), x - r(), y + h + j(), lineOptions)
			this.line(x + j(), y + h + r(), x + j(), y - r(), lineOptions)
		}
		return this
	}

	/** A smooth curve through the points (Catmull-Rom), with a little wobble. */
	curve(points: readonly Point[], o: LineOptions = {}) {
		let roughness = o.roughness ?? DEFAULTS.roughness
		let width = o.width ?? DEFAULTS.width
		let pass = (spread: number) => {
			let pts = points.map(
				([x, y]) => [x + this.#jitter(spread), y + this.#jitter(spread)] as Point,
			)
			return curvePath(pts)
		}
		let d = pass(roughness * 0.9)
		if (o.double ?? true) d += pass(roughness * 0.6)
		this.#push(d, width)
		return this
	}

	ellipse(cx: number, cy: number, w: number, h: number, o: LineOptions = {}) {
		let roughness = o.roughness ?? DEFAULTS.roughness
		let width = o.width ?? DEFAULTS.width
		let rx = w / 2
		let ry = h / 2
		let steps = Math.max(8, Math.ceil(Math.sqrt(Math.PI * (rx + ry)) * 1.4))
		let pass = (overlap: number) => {
			let start = this.#rnd() * Math.PI * 2
			let points: Point[] = []
			for (let i = 0; i <= steps + overlap; i++) {
				let a = start + (i / steps) * Math.PI * 2
				let s = 1 + this.#jitter(0.035 * roughness)
				points.push([cx + Math.cos(a) * rx * s, cy + Math.sin(a) * ry * s])
			}
			return curvePath(points)
		}
		let d = pass(1)
		if (o.double ?? true) d += pass(1)
		this.#push(d, width)
		return this
	}

	circle(cx: number, cy: number, diameter: number, o: LineOptions = {}) {
		return this.ellipse(cx, cy, diameter, diameter, o)
	}

	/** Part of an ellipse, from angle a0 to a1 (radians, clockwise from 3 o'clock). */
	arc(cx: number, cy: number, w: number, h: number, a0: number, a1: number, o: LineOptions = {}) {
		let steps = Math.max(4, Math.ceil(Math.abs(a1 - a0) * 3))
		let points: Point[] = []
		for (let i = 0; i <= steps; i++) {
			let a = a0 + ((a1 - a0) * i) / steps
			points.push([cx + (Math.cos(a) * w) / 2, cy + (Math.sin(a) * h) / 2])
		}
		return this.curve(points, { roughness: 0.6, ...o })
	}

	/** Shade a polygon with parallel pencil strokes, like "////". */
	hatch(points: readonly Point[], gap = 4.5, angle = -41) {
		let theta = (angle * Math.PI) / 180
		let cos = Math.cos(theta)
		let sin = Math.sin(theta)
		// Rotate so the shading runs horizontally, scan, then rotate back.
		let rotated = points.map(([x, y]) => [x * cos + y * sin, -x * sin + y * cos] as Point)
		let ys = rotated.map((p) => p[1])
		let top = Math.min(...ys)
		let bottom = Math.max(...ys)
		for (let y = top + gap / 2; y < bottom; y += gap) {
			let xs: number[] = []
			for (let i = 0; i < rotated.length; i++) {
				let [ax, ay] = rotated[i]!
				let [bx, by] = rotated[(i + 1) % rotated.length]!
				if ((ay <= y && by > y) || (by <= y && ay > y)) {
					xs.push(ax + ((y - ay) / (by - ay)) * (bx - ax))
				}
			}
			xs.sort((a, b) => a - b)
			for (let i = 0; i + 1 < xs.length; i += 2) {
				let [x1, y1] = unrotate(xs[i]!, y, cos, sin)
				let [x2, y2] = unrotate(xs[i + 1]!, y, cos, sin)
				this.line(x1, y1, x2, y2, { roughness: 0.8, bowing: 0.5, width: 0.8, double: false }, true)
			}
		}
		return this
	}

	hatchRect(x: number, y: number, w: number, h: number, gap?: number) {
		return this.hatch(
			[
				[x, y],
				[x + w, y],
				[x + w, y + h],
				[x, y + h],
			],
			gap,
		)
	}
}

function unrotate(x: number, y: number, cos: number, sin: number): Point {
	return [x * cos - y * sin, x * sin + y * cos]
}

function curvePath(points: readonly Point[]) {
	let [x0, y0] = points[0]!
	let d = `M${f(x0)} ${f(y0)}`
	for (let i = 0; i < points.length - 1; i++) {
		let p0 = points[i - 1] ?? points[i]!
		let p1 = points[i]!
		let p2 = points[i + 1]!
		let p3 = points[i + 2] ?? p2
		d +=
			`C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ` +
			`${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`
	}
	return d
}

/**
 * Lines and frames that fit whatever element they decorate. The server draws
 * them at a guessed size; the browser redraws them at the real one.
 */
export const shapes = {
	/** The sheet of paper the whole site is drawn on. */
	sheet(p: Pencil, w: number, h: number) {
		p.box(12, 12, w - 24, h - 24, { over: 16, width: 1.4, bowing: 0.5 })
		p.box(14, 14, w - 28, h - 28, { ...THIN, over: 10, bowing: 0.4, passes: 1 })
	},
	/** A double frame with corner ticks, like a hero banner on a wireframe. */
	frame(p: Pencil, w: number, h: number) {
		p.box(4, 4, w - 8, h - 8, { over: 12, width: 1.5 })
		p.box(10, 10, w - 20, h - 20, { ...THIN, over: 6, passes: 1 })
		let tick = (x: number, y: number, dx: number, dy: number) =>
			p.lines(
				[
					[x, y + dy * 12],
					[x, y],
					[x + dx * 12, y],
				],
				{ ...THIN, double: false },
			)
		tick(20, 20, 1, 1)
		tick(w - 20, 20, -1, 1)
		tick(20, h - 20, 1, -1)
		tick(w - 20, h - 20, -1, -1)
	},
	tile(p: Pencil, w: number, h: number) {
		p.box(5, 5, w - 10, h - 10, { over: 8, width: 1.3 })
	},
	underline(p: Pencil, w: number, h: number) {
		p.curve(
			[
				[2, h * 0.5],
				[w * 0.35, h * 0.25],
				[w * 0.7, h * 0.6],
				[w - 2, h * 0.35],
			],
			{ width: 1.8, roughness: 1.2 },
		)
		p.curve(
			[
				[w * 0.08, h * 0.95],
				[w * 0.45, h * 0.75],
				[w * 0.72, h * 0.92],
			],
			{ ...THIN, roughness: 0.9, double: false },
		)
	},
	nav(p: Pencil, w: number, h: number) {
		p.curve(
			[
				[2, h * 0.5],
				[w * 0.5, h * 0.2],
				[w - 2, h * 0.55],
			],
			{ width: 1.6, roughness: 0.9 },
		)
	},
	rule(p: Pencil, w: number, h: number) {
		p.line(0, h / 2, w, h / 2, { ...THIN, bowing: 0.6 })
	},
	divider(p: Pencil, w: number, h: number) {
		p.line(8, h / 2, w - 8, h / 2, { width: 1.4, bowing: 0.6 })
		p.line(24, h / 2 + 3, w - 40, h / 2 + 2, { ...THIN, bowing: 0.6, double: false })
	},
} satisfies Record<string, (p: Pencil, w: number, h: number) => void>

export type ShapeName = keyof typeof shapes

export function drawShape(name: ShapeName, seed: number, w: number, h: number) {
	let pencil = new Pencil(seed)
	shapes[name](pencil, w, h)
	return pencil.strokes
}
