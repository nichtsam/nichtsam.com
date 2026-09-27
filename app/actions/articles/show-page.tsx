import { css, unsafeHTML } from 'remix/ui'
import type { Handle } from 'remix/ui'

import { formatDate, type Article, type ArticleMeta } from '../../content/articles.ts'
import { routes } from '../../routes.ts'
import { Layout } from '../../ui/layout.tsx'
import { ArrowLeft, Clock } from '../../ui/public/doodles.tsx'
import { ReadingProgress } from '../../ui/public/reading-progress.tsx'

export interface ArticlePageProps {
	article: Article
	newer?: ArticleMeta
	older?: ArticleMeta
}

export function ArticlePage(handle: Handle<ArticlePageProps>) {
	return () => {
		let { article, newer, older } = handle.props
		return (
			<Layout
				current="articles"
				title={article.title}
				description={article.description}
				path={routes.articles.show.href({ slug: article.slug })}
				type="article"
			>
				<ReadingProgress targetId="article-body" />
				<article mix={articleStyle}>
					<a className="back" href={routes.articles.index.href()}>
						<ArrowLeft />
						all articles
					</a>
					<header>
						<time dateTime={article.publishedDate}>{formatDate(article.publishedDate)}</time>
						<h1>{article.title}</h1>
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
					</header>
					<div className="page">
						<div id="article-body" className="prose" innerHTML={unsafeHTML(article.html)} />
					</div>
				</article>

				{(newer || older) && (
					<nav mix={pagerStyle} aria-label="More articles">
						{older ? (
							<a className="older" href={routes.articles.show.href({ slug: older.slug })}>
								<span className="dir">← previous page</span>
								<span className="title">{older.title}</span>
							</a>
						) : (
							<span />
						)}
						{newer && (
							<a className="newer" href={routes.articles.show.href({ slug: newer.slug })}>
								<span className="dir">next page →</span>
								<span className="title">{newer.title}</span>
							</a>
						)}
					</nav>
				)}
			</Layout>
		)
	}
}

const articleStyle = css({
	maxWidth: '780px',
	marginInline: 'auto',
	'& .back': {
		display: 'inline-flex',
		alignItems: 'center',
		gap: '8px',
		marginBottom: '20px',
		fontFamily: 'var(--font-hand)',
		fontSize: '1.5rem',
		fontWeight: 700,
		textDecoration: 'none',
		color: 'var(--ink-soft)',
	},
	'& .back svg': { width: '32px', height: '16px' },
	'& .back:hover': { color: 'var(--pen-red)' },
	'& header': {
		display: 'grid',
		gap: '10px',
		marginBottom: '28px',
	},
	'& time': {
		fontFamily: 'var(--font-hand)',
		fontSize: '1.6rem',
		fontWeight: 700,
		color: 'var(--pen-red)',
		transform: 'rotate(-3deg)',
		transformOrigin: 'left',
		width: 'fit-content',
	},
	'& h1': {
		fontFamily: 'var(--font-hand)',
		fontSize: 'clamp(2.8rem, 8vw, 4.4rem)',
		fontWeight: 700,
		lineHeight: 0.95,
		textWrap: 'balance',
	},
	'& .meta': {
		display: 'flex',
		flexWrap: 'wrap',
		alignItems: 'center',
		gap: '4px 14px',
		fontFamily: 'var(--font-note)',
		fontSize: '1.1rem',
		color: 'var(--ink-soft)',
	},
	'& .read': { display: 'inline-flex', alignItems: 'center', gap: '6px' },
	'& .read svg': { width: '18px', height: '18px' },
	'& .tag': { color: 'var(--pen-blue)' },
	'& .draft': { color: 'var(--pen-red)' },
	// A ruled notebook page with a red margin line.
	'& .page': {
		position: 'relative',
		padding:
			'clamp(24px, 5vw, 48px) clamp(20px, 5vw, 48px) clamp(24px, 5vw, 48px) clamp(40px, 8vw, 76px)',
		background: 'var(--card)',
		boxShadow: '3px 6px 0 var(--shadow)',
		borderRadius: '3px 6px 4px 8px',
		backgroundImage:
			'linear-gradient(90deg, transparent calc(clamp(40px, 8vw, 76px) - 14px), var(--margin-line) calc(clamp(40px, 8vw, 76px) - 14px), var(--margin-line) calc(clamp(40px, 8vw, 76px) - 12px), transparent calc(clamp(40px, 8vw, 76px) - 12px))',
	},
	'& .page::before, & .page::after': {
		content: '""',
		position: 'absolute',
		left: 'clamp(10px, 2.5vw, 24px)',
		width: '14px',
		height: '14px',
		borderRadius: '50%',
		background: 'var(--paper)',
		boxShadow: 'inset 1px 2px 2px var(--shadow)',
	},
	'& .page::before': { top: '60px' },
	'& .page::after': { bottom: '60px' },
})

const pagerStyle = css({
	maxWidth: '780px',
	marginInline: 'auto',
	marginTop: '40px',
	display: 'grid',
	gridTemplateColumns: '1fr 1fr',
	gap: '20px',
	'& a': {
		display: 'grid',
		gap: '2px',
		padding: '14px 18px',
		textDecoration: 'none',
		border: '2px solid var(--ink)',
		borderRadius: 'var(--sketch-radius)',
		transition: 'transform 160ms ease',
	},
	'& a:hover': {
		transform: 'rotate(-1deg) translateY(-3px)',
		background: 'var(--hl-yellow)',
		color: 'var(--hl-ink)',
	},
	'& .newer': { textAlign: 'right', gridColumn: '2' },
	'& .dir': {
		fontFamily: 'var(--font-hand)',
		fontSize: '1.3rem',
		fontWeight: 700,
		color: 'var(--pen-red)',
	},
	'& .title': { fontWeight: 600, lineHeight: 1.3 },
	'@media (max-width: 560px)': {
		gridTemplateColumns: '1fr',
		'& .newer': { gridColumn: 'auto' },
	},
})
