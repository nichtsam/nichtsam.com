import type { Handle } from 'remix/ui'

import { createPen, InkPaths, type Ink } from './sketch.tsx'

/** Small pen-sketched icons, drawn on a 48×48 grid. */

export type IconName =
	| 'book'
	| 'wrench'
	| 'briefcase'
	| 'house'
	| 'branch'
	| 'layout'
	| 'pencil'
	| 'sun'
	| 'moon'
	| 'arrow-left'
	| 'clock'

function draw(name: IconName, seed: number): Ink[] {
	let pen = createPen({ seed, roughness: 1 })
	let o = { strokeWidth: 1.8 }
	switch (name) {
		case 'book':
			return [
				...pen.path(
					'M8 12 C 16 8, 22 10, 24 14 C 26 10, 32 8, 40 12 V 38 C 32 34, 26 36, 24 40 C 22 36, 16 34, 8 38 Z',
					o,
				),
				...pen.line(24, 14, 24, 40, o),
				...pen.line(13, 18, 20, 19, { thin: true }),
				...pen.line(13, 24, 20, 25, { thin: true }),
				...pen.line(28, 19, 35, 18, { thin: true }),
			]
		case 'wrench':
			return [
				...pen.path(
					'M30 8 C 22 8, 20 16, 22 20 L 8 34 C 6 38, 10 42, 14 40 L 28 26 C 32 28, 40 26, 40 18 L 34 22 L 28 20 L 26 14 Z',
					o,
				),
				...pen.circle(12, 36, 3, { thin: true }),
			]
		case 'briefcase':
			return [
				...pen.rect(6, 16, 36, 24, o),
				...pen.rect(17, 9, 14, 7, o),
				...pen.line(6, 26, 42, 26, { thin: true }),
				...pen.rect(21, 23, 6, 6, { thin: true }),
			]
		case 'house':
			return [
				...pen.poly(
					[
						[6, 22],
						[24, 7],
						[42, 22],
					],
					o,
				),
				...pen.rect(10, 21, 28, 20, o),
				...pen.rect(20, 28, 8, 13, { thin: true }),
			]
		case 'branch':
			return [
				...pen.circle(14, 10, 7, o),
				...pen.circle(14, 38, 7, o),
				...pen.circle(34, 16, 7, o),
				...pen.line(14, 14, 14, 34, o),
				...pen.curve(
					[
						[34, 20],
						[32, 28],
						[18, 28],
						[15, 34],
					],
					o,
				),
			]
		case 'layout':
			return [
				...pen.rect(6, 6, 36, 36, o),
				...pen.line(6, 14, 42, 14, { thin: true }),
				...pen.line(6, 34, 42, 34, { thin: true }),
				...pen.rect(10, 18, 28, 12, { hatch: 3, thin: true }),
			]
		case 'pencil':
			return [
				...pen.poly(
					[
						[8, 40],
						[11, 30],
						[34, 7],
						[41, 14],
						[18, 37],
					],
					o,
				),
				...pen.line(11, 30, 18, 37, { thin: true }),
				...pen.line(30, 11, 37, 18, { thin: true }),
			]
		case 'sun':
			return [
				...pen.circle(24, 24, 18, o),
				...[0, 1, 2, 3, 4, 5, 6, 7].flatMap((i) => {
					let a = (i / 8) * Math.PI * 2
					return pen.line(
						24 + Math.cos(a) * 14,
						24 + Math.sin(a) * 14,
						24 + Math.cos(a) * 20,
						24 + Math.sin(a) * 20,
						{ thin: true },
					)
				}),
			]
		case 'moon':
			return [
				...pen.path('M30 8 C 16 8, 10 22, 14 32 C 18 42, 32 44, 40 34 C 28 34, 20 22, 30 8 Z', {
					...o,
					hatch: 3,
				}),
			]
		case 'arrow-left':
			return [
				...pen.line(42, 24, 8, 24, o),
				...pen.lines(
					[
						[18, 14],
						[7, 24],
						[18, 34],
					],
					o,
				),
			]
		case 'clock':
			return [
				...pen.circle(24, 24, 34, o),
				...pen.lines(
					[
						[24, 13],
						[24, 25],
						[32, 29],
					],
					o,
				),
			]
	}
}

export function Icon(handle: Handle<{ name: IconName; className?: string; seed?: number }>) {
	return () => (
		<svg
			className={handle.props.className}
			viewBox="0 0 48 48"
			aria-hidden="true"
			focusable="false"
		>
			<InkPaths ink={draw(handle.props.name, handle.props.seed ?? 5)} />
		</svg>
	)
}

/** A single sketchy horizontal stroke, stretched to its container. */
export function Scribble(handle: Handle<{ className?: string; seed?: number }>) {
	return () => {
		let pen = createPen({ seed: handle.props.seed ?? 3, roughness: 1.4 })
		return (
			<svg
				className={handle.props.className}
				viewBox="0 0 300 12"
				preserveAspectRatio="none"
				aria-hidden="true"
			>
				<InkPaths
					ink={[
						...pen.line(2, 6, 298, 5, { strokeWidth: 2 }),
						...pen.line(40, 9, 250, 9, { thin: true }),
					]}
				/>
			</svg>
		)
	}
}
