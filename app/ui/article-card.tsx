import { css } from 'remix/ui'
import type { Handle } from 'remix/ui'

import { formatDate, type ArticleMeta } from '../content/articles.ts'
import { routes } from '../routes.ts'
import { Icon, type IconName } from './icons.tsx'

function iconFor(article: ArticleMeta): IconName {
	let words = article.keywords.join(' ')
	if (/git|repo/.test(words)) return 'branch'
	if (/css|layout|tailwind/.test(words)) return 'layout'
	return 'pencil'
}

/** An article as a wireframe card: an icon box, a title, a few lines of text. */
export function ArticleCard(handle: Handle<{ article: ArticleMeta; index?: number }>) {
	return () => {
		let { article, index = 0 } = handle.props
		let href = routes.articles.show.href({ slug: article.slug })
		return (
			<article className="frame frame-hover" mix={cardStyle}>
				<div className="icon-box frame">
					<Icon name={iconFor(article)} seed={20 + index} />
				</div>
				<div className="body">
					<p className="meta">
						<time dateTime={article.publishedDate}>{formatDate(article.publishedDate)}</time>
						<span>· {article.readingMinutes} min read</span>
						{article.draft && <span className="draft">· draft</span>}
					</p>
					<h2>
						<a href={href}>{article.title}</a>
					</h2>
					{article.description && <p className="description">{article.description}</p>}
					{article.keywords.length > 0 && (
						<p className="tags">{article.keywords.map((k) => `#${k}`).join('  ')}</p>
					)}
				</div>
			</article>
		)
	}
}

const cardStyle = css({
	position: 'relative',
	display: 'grid',
	gridTemplateColumns: '84px minmax(0, 1fr)',
	gap: '22px',
	padding: '14px 16px',
	transition: 'transform 180ms ease',
	'&:hover, &:focus-within': { transform: 'rotate(-0.4deg) translateY(-3px)' },
	'& .icon-box': {
		width: '84px',
		height: '84px',
		display: 'grid',
		placeItems: 'center',
	},
	'& .icon-box svg': { width: '46px', height: '46px' },
	'& .body': { display: 'grid', gap: '6px', alignContent: 'start' },
	'& .meta': {
		display: 'flex',
		flexWrap: 'wrap',
		gap: '0 8px',
		fontFamily: 'var(--font-sign)',
		fontWeight: 800,
		fontSize: '0.72rem',
		letterSpacing: '0.08em',
		textTransform: 'uppercase',
		color: 'var(--ink-soft)',
	},
	'& .draft': { color: 'var(--accent)' },
	'& h2': {
		fontFamily: 'var(--font-hand)',
		fontWeight: 400,
		fontSize: 'clamp(1.45rem, 3vw, 1.8rem)',
		lineHeight: 1.25,
		textWrap: 'balance',
	},
	'& h2 a': { textDecoration: 'none' },
	'& h2 a::after': { content: '""', position: 'absolute', inset: 0 },
	'& h2 a:hover': {
		textDecoration: 'underline wavy',
		textUnderlineOffset: '5px',
		textDecorationThickness: '1px',
	},
	'& .description': { color: 'var(--ink-soft)', maxWidth: '46rem' },
	'& .tags': { fontFamily: 'var(--font-hand)', fontSize: '0.95rem', whiteSpace: 'pre-wrap' },
	'@media (max-width: 520px)': {
		gridTemplateColumns: '1fr',
		'& .icon-box': { width: '64px', height: '64px' },
		'& .icon-box svg': { width: '36px', height: '36px' },
	},
})
