import { clientEntry, css, on, ref } from 'remix/ui'
import type { Handle } from 'remix/ui'

import { REFRESH_EVENT } from './ink.tsx'
import { Doodle, Sketch } from './sketch.tsx'
import { THEME_FORM_ID } from './theme-toggle.tsx'

export type HeroSlide = {
	id: string
	/** Line breaks become `<br>`. */
	heading: string
	body: string
	link: { href: string; label: string }
	art: 'desk' | 'book' | 'browser'
	artLabel: string
}

export type HeroProps = {
	slides: HeroSlide[]
	/** The theme the desk lamp switches to without JavaScript. */
	lampValue: 'light' | 'dark'
}

const ERASE_MS = 240

/**
 * The framed box at the top of the home page. You flip through it with the
 * arrows or dots: what's in the box is erased, then the next one is drawn.
 *
 * Without JavaScript all slides sit side by side in a strip you can scroll.
 * It never advances on its own.
 */
export const Hero = clientEntry(import.meta.url, function Hero(handle: Handle<HeroProps>) {
	let index = 0
	let enhanced = false
	let flipping = false
	let announcement = ''
	let section: HTMLElement | undefined

	handle.queueTask(() => {
		enhanced = true
		handle.update()
	})

	async function flip(to: number) {
		let { slides } = handle.props
		let next = (to + slides.length) % slides.length
		if (flipping || next === index || !section) return
		flipping = true
		let current = section.querySelector<HTMLElement>('[data-current]')
		if (current && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			current.dataset.erasing = ''
			current.querySelectorAll('.in').forEach((node) => node.classList.remove('in'))
			await new Promise((resolve) => setTimeout(resolve, ERASE_MS))
		}
		index = next
		announcement = `Slide ${next + 1} of ${slides.length}: ${slides[next]!.heading.replace(/\n/g, ' ')}`
		await handle.update()
		if (current) delete current.dataset.erasing
		document.dispatchEvent(new Event(REFRESH_EVENT))
		flipping = false
	}

	return () => {
		let { slides, lampValue } = handle.props
		return (
			<section
				aria-roledescription="carousel"
				aria-label="Introduction"
				data-enhanced={enhanced ? '' : undefined}
				mix={[
					heroStyle,
					ref((node) => (section = node)),
					on('keydown', (event) => {
						let target = event.target as Element
						if (!target.closest('.controls')) return
						if (event.key === 'ArrowLeft') void flip(index - 1)
						if (event.key === 'ArrowRight') void flip(index + 1)
					}),
				]}
			>
				<div className="stage">
					<Sketch shape="frame" seed={5} width={1000} height={440} className="frame" />
					<div
						className="track"
						id="hero-track"
						tabIndex={enhanced ? undefined : 0}
						aria-label={enhanced ? undefined : 'Introduction, scroll sideways for more'}
					>
						{slides.map((slide, i) => {
							let Heading = i === 0 ? ('h1' as const) : ('h2' as const)
							return (
								<div
									key={slide.id}
									className="slide"
									role="group"
									aria-roledescription="slide"
									aria-label={`${i + 1} of ${slides.length}`}
									data-current={i === index ? '' : undefined}
								>
									<div className="copy">
										<Heading className="heading">
											<span data-ink style="--d: 200ms">
												{slide.heading
													.split('\n')
													.flatMap((line, j) => (j > 0 ? [<br key={j} />, line] : [line]))}
											</span>
										</Heading>
										<p data-ink style="--d: 550ms">
											{slide.body}
										</p>
										<p data-ink style="--d: 800ms">
											<a className="pencil-link" href={slide.link.href}>
												{slide.link.label}
											</a>
										</p>
									</div>
									<div className="art">
										<Doodle name={slide.art} label={slide.artLabel} />
										{slide.art === 'desk' ? (
											<button
												className="lamp"
												type="submit"
												form={THEME_FORM_ID}
												name="theme"
												value={lampValue}
												aria-label="Switch the desk lamp (night mode)"
												title="Switch the lamp"
											/>
										) : null}
									</div>
								</div>
							)
						})}
					</div>
				</div>
				<div className="controls">
					<button
						type="button"
						className="arrow"
						aria-controls="hero-track"
						aria-label="Previous slide"
						mix={on('click', () => void flip(index - 1))}
					>
						<Doodle name="chevronLeft" ink={false} />
					</button>
					<ul className="dots">
						{slides.map((slide, i) => (
							<li key={slide.id}>
								<button
									type="button"
									aria-controls="hero-track"
									aria-label={`Slide ${i + 1}: ${slide.heading.replace(/\n/g, ' ')}`}
									aria-current={i === index ? 'true' : undefined}
									mix={on('click', () => void flip(i))}
								>
									<span />
								</button>
							</li>
						))}
					</ul>
					<button
						type="button"
						className="arrow"
						aria-controls="hero-track"
						aria-label="Next slide"
						mix={on('click', () => void flip(index + 1))}
					>
						<Doodle name="chevronRight" ink={false} />
					</button>
				</div>
				<p className="sr-only" aria-live="polite">
					{announcement}
				</p>
			</section>
		)
	}
})

// Without JavaScript: a strip of slides you scroll sideways, no controls.
// With JavaScript (`#js` is on before first paint): one slide at a time.
const withJs = ':root:has(#js[data-on]) &'

const heroStyle = css({
	'& .stage': { position: 'relative' },
	'& .frame': { position: 'absolute', inset: 0, width: '100%', height: '100%' },
	'& .track': {
		display: 'flex',
		gap: 'var(--gutter)',
		overflowX: 'auto',
		scrollSnapType: 'x mandatory',
		overscrollBehaviorX: 'contain',
		scrollbarWidth: 'thin',
	},
	'& .slide': {
		flex: '0 0 100%',
		scrollSnapAlign: 'start',
		display: 'grid',
		gridTemplateColumns: 'minmax(0, 1fr)',
		alignItems: 'center',
		gap: '1rem',
		padding: 'clamp(1.75rem, 1rem + 3vw, 3rem) clamp(1.25rem, 0.5rem + 3vw, 3rem)',
	},
	'& .heading': {
		marginBottom: '1rem',
		fontWeight: 400,
		fontSize: 'var(--step-3)',
		lineHeight: 1.12,
		letterSpacing: '0.02em',
		textTransform: 'uppercase',
	},
	'& .copy p': { maxWidth: '32ch', marginBottom: '1rem', color: 'var(--ink-soft)' },
	'& .copy p:last-child': { color: 'var(--ink)' },
	'& .art': { position: 'relative', justifySelf: 'center', width: '100%', maxWidth: '28rem' },
	'& .art .doodle': { width: '100%', height: 'auto' },
	'& .lamp': {
		position: 'absolute',
		left: '3%',
		top: '15%',
		width: '21%',
		height: '52%',
		padding: 0,
		background: 'none',
		border: 0,
		cursor: 'pointer',
	},
	'& .controls': {
		display: 'none',
		alignItems: 'center',
		justifyContent: 'center',
		gap: '0.5rem',
		marginTop: '0.75rem',
	},
	'& .arrow': {
		display: 'grid',
		placeItems: 'center',
		width: '44px',
		height: '44px',
		padding: 0,
		background: 'none',
		border: 0,
		cursor: 'pointer',
	},
	'& .arrow svg': { width: '22px', height: '28px' },
	'& .arrow:hover svg': { color: 'var(--accent)' },
	'& .dots': { display: 'flex', padding: 0, listStyle: 'none' },
	'& .dots button': {
		display: 'grid',
		placeItems: 'center',
		width: '44px',
		height: '44px',
		padding: 0,
		background: 'none',
		border: 0,
		cursor: 'pointer',
	},
	'& .dots span': {
		width: '11px',
		height: '11px',
		border: '1.5px solid var(--pencil)',
		borderRadius: '50%',
	},
	'& .dots [aria-current] span': { background: 'var(--ink)' },
	'& .dots button:hover span': { borderColor: 'var(--accent)' },
	'@media (min-width: 48rem)': {
		'& .slide': {
			gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 1fr)',
			gap: '2rem',
			minHeight: '26rem',
		},
	},
	[withJs]: {
		'& .track': { display: 'block', overflow: 'visible' },
		'& .slide:not([data-current])': { display: 'none' },
		'& .controls': { display: 'flex' },
	},
})
