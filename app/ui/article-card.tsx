import { css } from 'remix/ui'
import type { Handle } from 'remix/ui'

import { formatDate, type ArticleMeta } from '../content/articles.ts'
import { routes } from '../routes.ts'
import { PixelArt } from './public/pixel.tsx'
import { icons } from './public/sprites.ts'

export function ArticleCard(handle: Handle<{ article: ArticleMeta; index: number }>) {
	return () => {
		let { article, index } = handle.props
		let href = routes.articles.show.href({ slug: article.slug })
		return (
			<article mix={cardStyle} style={{ '--tilt': index % 2 ? '0.4deg' : '-0.4deg' }}>
				<div className="meta">
					<time dateTime={article.publishedDate}>{formatDate(article.publishedDate)}</time>
					<span className="read">
						<PixelArt sprite={icons.clock!} />
						{article.readingMinutes} min
					</span>
					{article.draft && <span className="draft">Draft</span>}
				</div>
				<h2>
					<a href={href}>{article.title}</a>
				</h2>
				{article.description && <p className="description">{article.description}</p>}
				{article.keywords.length > 0 && (
					<ul className="tags" aria-label="Keywords">
						{article.keywords.map((keyword) => (
							<li>#{keyword}</li>
						))}
					</ul>
				)}
				<span className="go" aria-hidden="true">
					▶
				</span>
			</article>
		)
	}
}

const cardStyle = css({
	position: 'relative',
	display: 'grid',
	gap: '10px',
	padding: '20px 56px 22px 22px',
	background: 'var(--surface)',
	border: 'var(--px) solid var(--line)',
	boxShadow: 'calc(var(--px) * 2) calc(var(--px) * 2) 0 var(--shadow)',
	transition: 'transform 90ms steps(2), box-shadow 90ms steps(2)',
	'&:hover, &:focus-within': {
		transform: 'translate(-4px, -4px) rotate(var(--tilt))',
		boxShadow: 'calc(var(--px) * 4) calc(var(--px) * 4) 0 var(--shadow)',
	},
	'& .meta': {
		display: 'flex',
		flexWrap: 'wrap',
		alignItems: 'center',
		gap: '8px 16px',
		fontFamily: 'var(--font-label)',
		fontSize: '0.75rem',
		color: 'var(--ink-soft)',
	},
	'& time': {
		padding: '0 8px',
		background: 'var(--ink)',
		color: 'var(--bg)',
	},
	'& .read': {
		display: 'inline-flex',
		alignItems: 'center',
		gap: '6px',
	},
	'& .read svg': { width: '12px', height: 'auto' },
	'& .draft': {
		padding: '0 8px',
		background: 'var(--accent)',
		color: 'var(--accent-ink)',
	},
	'& h2': {
		fontFamily: 'var(--font-display)',
		fontSize: 'clamp(1.35rem, 3vw, 1.75rem)',
		fontWeight: 700,
		lineHeight: 1.2,
	},
	'& h2 a': {
		textDecoration: 'none',
	},
	'& h2 a::after': {
		content: '""',
		position: 'absolute',
		inset: 0,
	},
	'& .description': {
		color: 'var(--ink-soft)',
		fontSize: '0.95rem',
		lineHeight: 1.6,
	},
	'& .tags': {
		display: 'flex',
		flexWrap: 'wrap',
		gap: '8px',
		listStyle: 'none',
		padding: 0,
		fontFamily: 'var(--font-label)',
		fontSize: '0.7rem',
	},
	'& .tags li': {
		padding: '0 6px',
		border: '2px solid var(--line)',
		background: 'var(--surface-2)',
	},
	'& .go': {
		position: 'absolute',
		right: '20px',
		top: '50%',
		translate: '0 -50%',
		fontSize: '1.25rem',
		color: 'var(--accent)',
		opacity: 0.35,
	},
	'&:hover .go, &:focus-within .go': {
		opacity: 1,
		animation: 'go-nudge 0.5s steps(2) infinite',
	},
	'@keyframes go-nudge': {
		'50%': { transform: 'translateX(4px)' },
	},
})
