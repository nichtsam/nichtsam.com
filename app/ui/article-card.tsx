import { css } from 'remix/ui'
import type { Handle } from 'remix/ui'

import { formatDate, type ArticleMeta } from '../content/articles.ts'
import { routes } from '../routes.ts'
import { Clock } from './public/doodles.tsx'

/** An article as an entry in a notebook: date in the margin, title highlighted on hover. */
export function ArticleCard(handle: Handle<{ article: ArticleMeta }>) {
	return () => {
		let { article } = handle.props
		let href = routes.articles.show.href({ slug: article.slug })
		return (
			<article mix={entryStyle}>
				<div className="margin">
					<time dateTime={article.publishedDate}>{formatDate(article.publishedDate)}</time>
				</div>
				<div className="body">
					<h2>
						<a href={href}>
							<span className="title">{article.title}</span>
						</a>
					</h2>
					{article.description && <p className="description">{article.description}</p>}
					<div className="meta">
						<span className="read">
							<Clock />
							{article.readingMinutes} min read
						</span>
						{article.keywords.map((keyword) => (
							<span className="tag">#{keyword}</span>
						))}
						{article.draft && <span className="draft">draft!</span>}
					</div>
				</div>
			</article>
		)
	}
}

const entryStyle = css({
	position: 'relative',
	display: 'grid',
	gridTemplateColumns: '110px minmax(0, 1fr)',
	gap: '0 28px',
	paddingBlock: '22px',
	backgroundImage: 'linear-gradient(90deg, var(--ink-soft) 55%, transparent 55%)',
	backgroundSize: '10px 1.5px',
	backgroundRepeat: 'repeat-x',
	backgroundPosition: 'bottom',
	'& .margin': {
		position: 'relative',
		paddingRight: '14px',
		borderRight: '2px solid var(--margin-line)',
		textAlign: 'right',
	},
	'& time': {
		fontFamily: 'var(--font-hand)',
		fontSize: '1.45rem',
		fontWeight: 700,
		color: 'var(--pen-red)',
		lineHeight: 1.1,
		display: 'inline-block',
		transform: 'rotate(-4deg)',
	},
	'& .body': {
		display: 'grid',
		gap: '8px',
	},
	'& h2': {
		fontFamily: 'var(--font-hand)',
		fontSize: 'clamp(1.9rem, 4vw, 2.4rem)',
		fontWeight: 700,
		lineHeight: 1.05,
	},
	'& h2 a': {
		textDecoration: 'none',
	},
	'& h2 a::after': {
		content: '""',
		position: 'absolute',
		inset: 0,
	},
	'& .title': {
		backgroundImage:
			'linear-gradient(100deg, transparent 1%, var(--hl-yellow) 3%, var(--hl-yellow) 96%, transparent 99%)',
		backgroundSize: '0% 55%',
		backgroundPosition: '0 88%',
		backgroundRepeat: 'no-repeat',
		transition: 'background-size 350ms ease-out',
	},
	'&:hover .title, &:focus-within .title': {
		backgroundSize: '100% 55%',
	},
	'& .description': {
		color: 'var(--ink-soft)',
		maxWidth: '44rem',
	},
	'& .meta': {
		display: 'flex',
		flexWrap: 'wrap',
		alignItems: 'center',
		gap: '4px 14px',
		fontFamily: 'var(--font-note)',
		fontSize: '1.05rem',
		color: 'var(--ink-soft)',
	},
	'& .read': { display: 'inline-flex', alignItems: 'center', gap: '6px' },
	'& .read svg': { width: '18px', height: '18px' },
	'& .tag': { color: 'var(--pen-blue)' },
	'& .draft': {
		padding: '0 8px',
		border: '2px solid var(--pen-red)',
		color: 'var(--pen-red)',
		borderRadius: 'var(--sketch-radius)',
		transform: 'rotate(-4deg)',
	},
	'@media (max-width: 560px)': {
		gridTemplateColumns: '1fr',
		'& .margin': { border: 0, textAlign: 'left', paddingRight: 0 },
	},
})
