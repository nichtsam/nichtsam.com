import type { Handle } from 'remix/ui'

import { drawDoodle, type DoodleName } from './doodles.ts'
import { drawShape, type ShapeName, type Stroke } from './pencil.ts'

function paths(strokes: Stroke[], weight = 1) {
	return strokes.map((stroke, i) => (
		<path
			key={i}
			d={stroke.d}
			strokeWidth={Math.round(stroke.width * weight * 100) / 100}
			className={stroke.hatch ? 'hatch' : undefined}
		/>
	))
}

export interface SketchProps {
	shape: ShapeName
	seed: number
	/** The size the server guesses; the browser redraws at the real size. */
	width: number
	height: number
	className?: string
	/** Draw in when scrolled into view. */
	ink?: boolean
}

/**
 * A frame or line that fits the element it decorates. It stretches with its
 * box right away, and `ink.tsx` redraws it at the measured size.
 */
export function Sketch(handle: Handle<SketchProps>) {
	return () => {
		let { shape, seed, width, height, className, ink = true } = handle.props
		return (
			<svg
				className={className ? `pencil sketch ${className}` : 'pencil sketch'}
				viewBox={`0 0 ${width} ${height}`}
				preserveAspectRatio="none"
				aria-hidden="true"
				focusable="false"
				data-sketch={shape}
				data-seed={seed}
				data-ink={ink ? '' : undefined}
			>
				{paths(drawShape(shape, seed, width, height))}
			</svg>
		)
	}
}

export interface DoodleProps {
	name: DoodleName
	/** Describes a meaningful drawing; decorative ones are hidden from assistive tech. */
	label?: string
	/** Scales stroke widths, for drawings shown much larger or smaller than drawn. */
	weight?: number
	className?: string
	ink?: boolean
}

/** A fixed drawing that scales as a whole. */
export function Doodle(handle: Handle<DoodleProps>) {
	return () => {
		let { name, label, weight, className, ink = true } = handle.props
		let { width, height, top, strokes } = drawDoodle(name)
		return (
			<svg
				className={className ? `pencil doodle ${className}` : 'pencil doodle'}
				viewBox={`0 ${top} ${width} ${height}`}
				role={label ? 'img' : undefined}
				aria-label={label}
				aria-hidden={label ? undefined : 'true'}
				focusable="false"
				data-ink={ink ? '' : undefined}
			>
				{name === 'desk' ? (
					<polygon className="lamp-light" points="60,210 104,184 232,300 92,300" />
				) : null}
				{paths(strokes, weight)}
				{name === 'desk' ? <rect className="cursor" x={216} y={229} width={7} height={11} /> : null}
			</svg>
		)
	}
}
