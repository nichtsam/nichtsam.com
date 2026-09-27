import type { Handle } from 'remix/ui'

/**
 * Hand-drawn SVG bits. Every doodle strokes with `currentColor` so it follows
 * the text color (ink on paper, chalk on the board).
 */

interface DoodleProps {
	className?: string
	/** Accessible label; decorative when omitted. */
	label?: string
	style?: Record<string, string | number>
}

function a11y(label?: string) {
	return label
		? { role: 'img' as const, 'aria-label': label }
		: { 'aria-hidden': 'true' as const, focusable: 'false' as const }
}

const stroke = {
	fill: 'none',
	stroke: 'currentColor',
	strokeLinecap: 'round',
	strokeLinejoin: 'round',
} as const

export function Underline(handle: Handle<DoodleProps>) {
	return () => (
		<svg
			className={handle.props.className}
			style={handle.props.style}
			viewBox="0 0 200 16"
			preserveAspectRatio="none"
			{...a11y(handle.props.label)}
		>
			<path
				{...stroke}
				strokeWidth={3.5}
				pathLength={1}
				d="M3 10 C 38 3, 70 13, 104 8 S 170 3, 197 9 M 30 14 C 70 10, 120 13, 160 11"
			/>
		</svg>
	)
}

export function CircleScribble(handle: Handle<DoodleProps>) {
	return () => (
		<svg
			className={handle.props.className}
			style={handle.props.style}
			viewBox="0 0 200 60"
			preserveAspectRatio="none"
			{...a11y(handle.props.label)}
		>
			<path
				{...stroke}
				strokeWidth={2.5}
				pathLength={1}
				d="M36 8 C 110 -2, 196 8, 194 30 C 192 52, 90 58, 34 52 C 2 48, 2 22, 30 12 C 60 3, 120 4, 150 8"
			/>
		</svg>
	)
}

export function Arrow(handle: Handle<DoodleProps>) {
	return () => (
		<svg
			className={handle.props.className}
			style={handle.props.style}
			viewBox="0 0 100 60"
			{...a11y(handle.props.label)}
		>
			<path {...stroke} strokeWidth={2.5} d="M6 10 C 20 44, 56 54, 88 40" />
			<path {...stroke} strokeWidth={2.5} d="M74 32 L 90 39 L 78 52" />
		</svg>
	)
}

export function Star(handle: Handle<DoodleProps>) {
	return () => (
		<svg
			className={handle.props.className}
			style={handle.props.style}
			viewBox="0 0 40 40"
			{...a11y(handle.props.label)}
		>
			<path
				{...stroke}
				strokeWidth={2.2}
				d="M20 4 L 24 15 L 36 16 L 27 24 L 30 36 L 20 29 L 10 36 L 13 24 L 4 16 L 16 15 Z"
			/>
		</svg>
	)
}

export function Heart(handle: Handle<DoodleProps>) {
	return () => (
		<svg
			className={handle.props.className}
			style={handle.props.style}
			viewBox="0 0 40 36"
			{...a11y(handle.props.label)}
		>
			<path
				{...stroke}
				strokeWidth={2.4}
				d="M20 33 C 8 24, 2 17, 4 10 C 6 3, 16 2, 20 10 C 23 2, 34 2, 36 10 C 38 18, 30 25, 20 33 Z"
			/>
		</svg>
	)
}

export function Sun(handle: Handle<DoodleProps>) {
	return () => (
		<svg
			className={handle.props.className}
			style={handle.props.style}
			viewBox="0 0 40 40"
			{...a11y(handle.props.label)}
		>
			<path
				{...stroke}
				strokeWidth={2.2}
				d="M20 12 C 26 11, 29 16, 28 21 C 27 27, 20 29, 15 26 C 10 22, 12 13, 21 12"
			/>
			<path
				{...stroke}
				strokeWidth={2.2}
				d="M20 3 V 7 M20 33 V 37 M3 20 H 7 M33 20 H 37 M8 8 L 11 11 M29 29 L 32 32 M32 8 L 29 11 M8 32 L 11 29"
			/>
		</svg>
	)
}

export function Moon(handle: Handle<DoodleProps>) {
	return () => (
		<svg
			className={handle.props.className}
			style={handle.props.style}
			viewBox="0 0 40 40"
			{...a11y(handle.props.label)}
		>
			<path
				{...stroke}
				strokeWidth={2.2}
				d="M26 6 C 14 6, 8 16, 10 24 C 12 33, 24 37, 33 30 C 22 30, 16 20, 26 6 Z"
			/>
			<path
				{...stroke}
				strokeWidth={1.8}
				d="M32 12 l 1 3 l 3 1 l -3 1 l -1 3 l -1 -3 l -3 -1 l 3 -1 Z"
			/>
		</svg>
	)
}

export function GithubDoodle(handle: Handle<DoodleProps>) {
	return () => (
		<svg
			className={handle.props.className}
			style={handle.props.style}
			viewBox="0 0 40 40"
			{...a11y(handle.props.label)}
		>
			<path
				{...stroke}
				strokeWidth={2.2}
				d="M13 33 C 5 29, 3 20, 6 13 C 10 5, 22 2, 30 6 C 38 11, 39 23, 33 30 C 31 32, 29 33, 27 34"
			/>
			<path
				{...stroke}
				strokeWidth={2.2}
				d="M16 35 V 29 C 11 28, 10 24, 11 20 L 10 14 L 14 16 C 17 15, 23 15, 26 16 L 30 14 L 29 20 C 30 25, 28 28, 24 29 V 35"
			/>
			<path {...stroke} strokeWidth={2} d="M16 31 C 12 32, 10 30, 9 28" />
		</svg>
	)
}

export function LinkedinDoodle(handle: Handle<DoodleProps>) {
	return () => (
		<svg
			className={handle.props.className}
			style={handle.props.style}
			viewBox="0 0 40 40"
			{...a11y(handle.props.label)}
		>
			<path
				{...stroke}
				strokeWidth={2.2}
				d="M7 5 C 16 4, 26 4, 34 6 C 36 15, 36 26, 34 35 C 24 36, 14 36, 6 34 C 4 25, 4 14, 7 5 Z"
			/>
			<path
				{...stroke}
				strokeWidth={2.6}
				d="M13 18 V 29 M13 12.5 V 13 M19 29 V 18 M19 22 C 21 17, 28 16, 28 22 V 29"
			/>
		</svg>
	)
}

export function ArrowLeft(handle: Handle<DoodleProps>) {
	return () => (
		<svg
			className={handle.props.className}
			style={handle.props.style}
			viewBox="0 0 40 20"
			{...a11y(handle.props.label)}
		>
			<path {...stroke} strokeWidth={2.2} d="M37 11 C 26 9, 16 11, 4 10 M11 3 L 3 10 L 11 17" />
		</svg>
	)
}

export function Clock(handle: Handle<DoodleProps>) {
	return () => (
		<svg
			className={handle.props.className}
			style={handle.props.style}
			viewBox="0 0 40 40"
			{...a11y(handle.props.label)}
		>
			<path
				{...stroke}
				strokeWidth={2.4}
				d="M20 5 C 30 4, 36 12, 35 21 C 34 31, 25 36, 17 34 C 8 32, 4 23, 6 15 C 8 9, 13 5, 22 6"
			/>
			<path {...stroke} strokeWidth={2.4} d="M20 11 V 21 L 27 25" />
		</svg>
	)
}

/** Hand-drawn wobble filters, rendered once per page. */
export function DoodleDefs() {
	return () => (
		<svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
			<defs>
				<filter id="wobble">
					<feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves={2} seed={1}>
						<animate
							attributeName="seed"
							values="1;2;3;4"
							dur="0.5s"
							calcMode="discrete"
							repeatCount="indefinite"
						/>
					</feTurbulence>
					<feDisplacementMap in="SourceGraphic" scale={3} />
				</filter>
				<filter id="wobble-still">
					<feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves={2} seed={1} />
					<feDisplacementMap in="SourceGraphic" scale={3} />
				</filter>
			</defs>
		</svg>
	)
}
