import { css, unsafeHTML } from 'remix/ui'
import type { Handle } from 'remix/ui'

import { formatDate, type Article, type ArticleMeta } from '../../content/articles.ts'
import { routes } from '../../routes.ts'
import { Layout } from '../../ui/layout.tsx'
import { PixelArt } from '../../ui/public/pixel.tsx'
import { ReadingProgress } from '../../ui/public/reading-progress.tsx'
import { icons } from '../../ui/public/sprites.ts'

export interface ArticlePageProps {
	article: Article
	newer?: ArticleMeta
	older?: ArticleMeta
}

export function ArticlePage(handle: Handle<ArticlePageProps>) {
	return () => {
		let { article, newer, older } = handle.props
		let href = routes.articles.show.href({ slug: article.slug })
		return (
			<Layout
				current="articles"
				title={article.title}
				description={article.description}
				path={href}
				type="article"
			>
				<ReadingProgress targetId="article-body" />
				<article mix={articleStyle}>
					<a className="back" href={routes.articles.index.href()}>
						<PixelArt sprite={icons.arrowLeft!} />
						All articles
					</a>
					<header>
						<h1>{article.title}</h1>
						<div className="meta">
							<time dateTime={article.publishedDate}>{formatDate(article.publishedDate)}</time>
							<span className="read">
								<PixelArt sprite={icons.clock!} />
								{article.readingMinutes} min read
							</span>
							{article.draft && <span className="draft">Draft</span>}
						</div>
						{article.keywords.length > 0 && (
							<ul className="tags" aria-label="Keywords">
								{article.keywords.map((keyword) => (
									<li>#{keyword}</li>
								))}
							</ul>
						)}
					</header>
					<div id="article-body" className="body prose" innerHTML={unsafeHTML(article.html)} />
				</article>

				{(newer || older) && (
					<nav mix={pagerStyle} aria-label="More articles">
						{older ? (
							<a className="older" href={routes.articles.show.href({ slug: older.slug })}>
								<span className="dir">◀ Previous</span>
								<span className="title">{older.title}</span>
							</a>
						) : (
							<span />
						)}
						{newer && (
							<a className="newer" href={routes.articles.show.href({ slug: newer.slug })}>
								<span className="dir">Next ▶</span>
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
	maxWidth: '760px',
	marginInline: 'auto',
	'& .back': {
		display: 'inline-flex',
		alignItems: 'center',
		gap: '8px',
		marginBottom: '28px',
		fontFamily: 'var(--font-label)',
		fontSize: '0.8rem',
		textDecoration: 'none',
		color: 'var(--ink-soft)',
	},
	'& .back svg': { width: '14px', height: 'auto' },
	'& .back:hover': { color: 'var(--accent)' },
	'& .back:hover svg': { animation: 'back-nudge 0.5s steps(2) infinite' },
	'& header': {
		display: 'grid',
		gap: '16px',
		marginBottom: '36px',
	},
	'& h1': {
		fontFamily: 'var(--font-display)',
		fontSize: 'clamp(2rem, 6vw, 3.25rem)',
		fontWeight: 700,
		lineHeight: 1.1,
		textWrap: 'balance',
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
	'& .read': { display: 'inline-flex', alignItems: 'center', gap: '6px' },
	'& .read svg': { width: '12px', height: 'auto' },
	'& .draft': { padding: '0 8px', background: 'var(--accent)', color: 'var(--accent-ink)' },
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
	'& .body': {
		padding: 'clamp(20px, 5vw, 44px)',
		background: 'var(--surface)',
		border: 'var(--px) solid var(--line)',
		boxShadow: 'calc(var(--px) * 2) calc(var(--px) * 2) 0 var(--shadow)',
	},
	'@keyframes back-nudge': {
		'50%': { transform: 'translateX(-3px)' },
	},
})

const pagerStyle = css({
	maxWidth: '760px',
	marginInline: 'auto',
	marginTop: '40px',
	display: 'grid',
	gridTemplateColumns: '1fr 1fr',
	gap: '20px',
	'& a': {
		display: 'grid',
		gap: '4px',
		padding: '14px 18px',
		textDecoration: 'none',
		background: 'var(--surface)',
		border: 'var(--px) solid var(--line)',
		boxShadow: '0 var(--px) 0 var(--shadow)',
		transition: 'transform 80ms steps(2)',
	},
	'& a:hover': {
		transform: 'translateY(-4px)',
		background: 'var(--gold)',
		color: '#22203a',
	},
	'& .newer': { textAlign: 'right', gridColumn: '2' },
	'& .dir': { fontFamily: 'var(--font-label)', fontSize: '0.75rem', color: 'var(--accent)' },
	'& a:hover .dir': { color: '#22203a' },
	'& .title': { fontFamily: 'var(--font-display)', fontWeight: 500, lineHeight: 1.3 },
	'@media (max-width: 560px)': {
		gridTemplateColumns: '1fr',
		'& .newer': { gridColumn: 'auto' },
	},
})
