import type { Handle } from 'remix/ui'

/** One solid run of pixels: [x, y, width, height, color]. */
export type Rect = readonly [number, number, number, number, string]

export interface Sprite {
	w: number
	h: number
	rects: readonly Rect[]
}

/**
 * Builds a sprite from rows of characters. Each character maps to a color in
 * `palette`; `.` (or any unmapped character) is transparent. Horizontal runs of
 * the same color are merged into a single rect to keep the SVG small.
 */
export function fromRows(rows: readonly string[], palette: Record<string, string>): Sprite {
	let rects: Rect[] = []
	let w = Math.max(...rows.map((row) => row.length))
	rows.forEach((row, y) => {
		let x = 0
		while (x < row.length) {
			let char = row[x]!
			let color = palette[char]
			let start = x
			while (x < row.length && row[x] === char) x++
			if (color) rects.push([start, y, x - start, 1, color])
		}
	})
	return { w, h: rows.length, rects }
}

/** Imperative painter for larger, mostly-rectangular sprites. */
export function paint(w: number, h: number, draw: (fill: Fill) => void): Sprite {
	let rects: Rect[] = []
	draw((x, y, rw, rh, color) => {
		rects.push([x, y, rw, rh, color])
	})
	return { w, h, rects }
}

export type Fill = (x: number, y: number, w: number, h: number, color: string) => void

/** Mirrors a sprite horizontally. */
export function flip(sprite: Sprite): Sprite {
	return {
		...sprite,
		rects: sprite.rects.map(([x, y, w, h, c]) => [sprite.w - x - w, y, w, h, c] as const),
	}
}

export interface PixelArtProps {
	sprite: Sprite
	/** Accessible label. Omit for decorative art. */
	label?: string
	className?: string
	style?: Record<string, string | number>
}

export function PixelArt(handle: Handle<PixelArtProps>) {
	return () => {
		let { sprite, label, className, style } = handle.props
		return (
			<svg
				className={className ? `px-art ${className}` : 'px-art'}
				viewBox={`0 0 ${sprite.w} ${sprite.h}`}
				width={sprite.w}
				height={sprite.h}
				style={style}
				role={label ? 'img' : undefined}
				aria-label={label}
				aria-hidden={label ? undefined : 'true'}
				focusable="false"
			>
				{sprite.rects.map(([x, y, w, h, fill]) => (
					<rect x={x} y={y} width={w} height={h} fill={fill} />
				))}
			</svg>
		)
	}
}
