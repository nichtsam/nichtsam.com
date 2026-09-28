import { css, unsafeHTML } from 'remix/ui'
import type { Handle } from 'remix/ui'

import { formatDate, type Article, type ArticleMeta } from '../../content/articles.ts'
import { routes } from '../../routes.ts'
import { Layout } from '../../ui/layout.tsx'
import { Icon, Scribble } from '../../ui/icons.tsx'
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
						<Icon name="arrow-left" seed={3} />
						all articles
					</a>
					<header>
						<time dateTime={article.publishedDate}>{formatDate(article.publishedDate)}</time>
						<h1>{article.title}</h1>
						<Scribble className="scribble title-line" seed={article.title.length} />
						<div className="meta">
							<span className="read">
								<Icon name="clock" seed={6} />
								{article.readingMinutes} min read
							</span>
							{article.keywords.map((keyword) => (
								<span className="tag">#{keyword}</span>
							))}
							{article.draft && <span className="draft">draft!</span>}
						</div>
					</header>
					<div className="page frame">
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
		fontFamily: 'var(--font-sign)',
		fontWeight: 800,
		fontSize: '0.78rem',
		letterSpacing: '0.08em',
		textTransform: 'uppercase',
		textDecoration: 'none',
		color: 'var(--ink-soft)',
	},
	'& .back svg': { width: '26px', height: '26px' },
	'& .back:hover': { color: 'var(--ink)' },
	'& header': { display: 'grid', gap: '10px', marginBottom: '28px' },
	'& time': {
		fontFamily: 'var(--font-sign)',
		fontWeight: 800,
		fontSize: '0.78rem',
		letterSpacing: '0.1em',
		textTransform: 'uppercase',
		color: 'var(--accent)',
	},
	'& h1': {
		fontFamily: 'var(--font-hand)',
		fontWeight: 400,
		fontSize: 'clamp(2.3rem, 7vw, 3.6rem)',
		lineHeight: 1.1,
		textWrap: 'balance',
	},
	'& .title-line': { width: 'min(320px, 70%)', height: '10px' },
	'& .meta': {
		display: 'flex',
		flexWrap: 'wrap',
		alignItems: 'center',
		gap: '4px 14px',
		fontFamily: 'var(--font-hand)',
		color: 'var(--ink-soft)',
	},
	'& .read': { display: 'inline-flex', alignItems: 'center', gap: '6px' },
	'& .read svg': { width: '20px', height: '20px' },
	'& .draft': { color: 'var(--accent)' },
	'& .page': { padding: 'clamp(10px, 4vw, 36px)' },
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
		padding: '8px 12px',
		textDecoration: 'none',
		border: '12px solid transparent',
		borderImage: 'var(--frame-a) 14 / 12px / 2px stretch',
		transition: 'transform 160ms ease',
	},
	'& a:hover': { transform: 'rotate(-1deg) translateY(-3px)' },
	'& .newer': { textAlign: 'right', gridColumn: '2' },
	'& .dir': {
		fontFamily: 'var(--font-sign)',
		fontWeight: 800,
		fontSize: '0.72rem',
		letterSpacing: '0.1em',
		textTransform: 'uppercase',
		color: 'var(--ink-soft)',
	},
	'& .title': { fontFamily: 'var(--font-hand)', fontSize: '1.15rem', lineHeight: 1.3 },
	'@media (max-width: 560px)': {
		gridTemplateColumns: '1fr',
		'& .newer': { gridColumn: 'auto' },
	},
})
