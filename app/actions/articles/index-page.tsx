import { css } from 'remix/ui'
import type { Handle } from 'remix/ui'

import type { ArticleMeta } from '../../content/articles.ts'
import { routes } from '../../routes.ts'
import { ArticleCard } from '../../ui/article-card.tsx'
import { Layout } from '../../ui/layout.tsx'

export function ArticlesIndexPage(handle: Handle<{ articles: ArticleMeta[] }>) {
	return () => {
		let { articles } = handle.props
		return (
			<Layout
				current="articles"
				title="Articles"
				description="Notes, guides and write-ups by Samuel Jensen."
				path={routes.articles.index.href()}
			>
				<header mix={headerStyle}>
					<p className="eyebrow">Quest log</p>
					<h1>Articles</h1>
					<p className="count">
						{articles.length} {articles.length === 1 ? 'entry' : 'entries'} found. Some are even
						finished.
					</p>
				</header>
				{articles.length ? (
					<div mix={listStyle}>
						{articles.map((article, index) => (
							<ArticleCard key={article.slug} article={article} index={index} />
						))}
					</div>
				) : (
					<p>Nothing here yet. Check back soon!</p>
				)}
			</Layout>
		)
	}
}

const headerStyle = css({
	display: 'grid',
	gap: '8px',
	marginBottom: '40px',
	'& .eyebrow': {
		fontFamily: 'var(--font-label)',
		fontSize: '0.8rem',
		color: 'var(--accent)',
	},
	'& h1': {
		fontFamily: 'var(--font-display)',
		fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
		fontWeight: 700,
		lineHeight: 1,
		textShadow: '4px 4px 0 var(--gold)',
	},
	'& .count': {
		color: 'var(--ink-soft)',
	},
})

const listStyle = css({
	display: 'grid',
	gap: '24px',
})
