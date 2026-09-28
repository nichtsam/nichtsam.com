import { css } from 'remix/ui'
import type { Handle } from 'remix/ui'

import { formatDate, type ArticleMeta } from '../content/articles.ts'
import type { Project } from '../content/projects.ts'
import { site } from '../content/site.ts'
import { routes } from '../routes.ts'
import type { DoodleName } from './public/doodles.ts'
import { Doodle, Sketch } from './public/sketch.tsx'

interface TileData {
	key: string
	href: string
	title: string
	note: string
	icon: DoodleName
	external?: boolean
}

/** Projects as squares with a drawing in each, like the boxes on a wireframe. */
export function ProjectTiles(handle: Handle<{ projects: Project[]; headingLevel?: 2 | 3 }>) {
	return () => {
		let tiles: TileData[] = [
			...handle.props.projects.map((project) => ({
				key: project.slug,
				href: routes.projects.show.href({ slug: project.slug }),
				title: project.title,
				note: project.summary,
				icon: 'window' as const,
			})),
			{
				key: 'github',
				href: site.social.github,
				title: 'More on GitHub',
				note: 'Odds and ends.',
				icon: 'github',
				external: true,
			},
		]
		let Heading = handle.props.headingLevel === 2 ? ('h2' as const) : ('h3' as const)
		return (
			<ul mix={tilesStyle}>
				{tiles.map((tile, i) => (
					<li key={tile.key}>
						<a href={tile.href} rel={tile.external ? 'noreferrer' : undefined}>
							<span className="square">
								<Sketch shape="tile" seed={40 + i} width={260} height={220} />
								<Doodle name={tile.icon} weight={0.6} />
							</span>
							<Heading className="title">
								<span data-ink style={`--d: ${150 + i * 90}ms`}>
									{tile.title}
									{tile.external ? <span aria-hidden="true"> ↗</span> : null}
								</span>
							</Heading>
							<span className="note" data-ink style={`--d: ${250 + i * 90}ms`}>
								{tile.note}
							</span>
						</a>
					</li>
				))}
			</ul>
		)
	}
}

/** Articles as ruled rows: title, then date and reading time. */
export function ArticleList(handle: Handle<{ articles: ArticleMeta[]; headingLevel?: 2 | 3 }>) {
	return () => {
		let Heading = handle.props.headingLevel === 2 ? ('h2' as const) : ('h3' as const)
		return (
			<ul mix={rowsStyle}>
				{handle.props.articles.map((article, i) => (
					<li key={article.slug}>
						<a href={routes.articles.show.href({ slug: article.slug })}>
							<Heading className="title">
								<span data-ink style={`--d: ${i * 120}ms`}>
									{article.title}
								</span>
							</Heading>
							<span className="meta" data-ink style={`--d: ${80 + i * 120}ms`}>
								<time dateTime={article.publishedDate}>{formatDate(article.publishedDate)}</time> ·{' '}
								{article.readingMinutes} min read
							</span>
						</a>
						<Sketch shape="rule" seed={60 + i} width={900} height={6} className="rule" />
					</li>
				))}
			</ul>
		)
	}
}

const tilesStyle = css({
	display: 'grid',
	gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 13rem), 1fr))',
	gap: 'clamp(1.5rem, 1rem + 2vw, 2.5rem)',
	padding: 0,
	listStyle: 'none',
	'& a': { display: 'block', textAlign: 'center' },
	'& .square': {
		position: 'relative',
		display: 'grid',
		placeItems: 'center',
		aspectRatio: '1.18',
		marginBottom: '0.9rem',
		transition: 'transform 180ms ease',
	},
	'& .square > .sketch': { position: 'absolute', inset: 0, width: '100%', height: '100%' },
	'& .square > .doodle': { width: 'min(38%, 5.5rem)', height: 'auto' },
	'& .title': { fontWeight: 400, fontSize: 'var(--step-1)', lineHeight: 1.3 },
	'& .note': {
		display: 'block',
		marginTop: '0.2rem',
		fontSize: 'var(--step--1)',
		color: 'var(--ink-soft)',
	},
	'& a:hover .title, & a:focus-visible .title': { color: 'var(--accent)' },
	'@media (hover: hover) and (prefers-reduced-motion: no-preference)': {
		'& a:hover .square': { transform: 'translateY(-3px) rotate(-0.6deg)' },
	},
})

const rowsStyle = css({
	padding: 0,
	listStyle: 'none',
	'& li': { position: 'relative' },
	'& a': { display: 'block', padding: '1rem 0 0.9rem' },
	'& .title': { fontWeight: 400, fontSize: 'var(--step-1)', lineHeight: 1.35 },
	'& .meta': {
		display: 'block',
		marginTop: '0.15rem',
		fontSize: 'var(--step--1)',
		color: 'var(--ink-soft)',
	},
	'& a:hover .title, & a:focus-visible .title': { color: 'var(--accent)' },
	'& .rule': { position: 'absolute', left: 0, bottom: 0, width: '100%', height: '6px' },
	'@media (min-width: 40rem)': {
		'& a': {
			display: 'grid',
			gridTemplateColumns: 'minmax(0, 1fr) auto',
			alignItems: 'baseline',
			gap: '1.5rem',
		},
		'& .meta': { marginTop: 0 },
	},
})
