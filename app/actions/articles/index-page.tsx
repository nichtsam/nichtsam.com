import { css } from 'remix/ui'
import type { Handle } from 'remix/ui'

import type { ArticleMeta } from '../../content/articles.ts'
import { routes } from '../../routes.ts'
import { ArticleCard } from '../../ui/article-card.tsx'
import { Layout } from '../../ui/layout.tsx'
import { Underline } from '../../ui/public/doodles.tsx'

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
					<h1>
						articles
						<Underline className="line boil" />
					</h1>
					<p>
						{articles.length} {articles.length === 1 ? 'page' : 'pages'} so far. Some of them are
						even finished.
					</p>
				</header>
				{articles.length ? (
					<div>
						{articles.map((article) => (
							<ArticleCard key={article.slug} article={article} />
						))}
					</div>
				) : (
					<p>Nothing written down yet. Check back soon!</p>
				)}
			</Layout>
		)
	}
}

const headerStyle = css({
	display: 'grid',
	gap: '14px',
	marginBottom: '28px',
	'& h1': {
		position: 'relative',
		width: 'fit-content',
		fontFamily: 'var(--font-hand)',
		fontSize: 'clamp(3.4rem, 10vw, 5.5rem)',
		fontWeight: 700,
		lineHeight: 0.9,
		transform: 'rotate(-2deg)',
	},
	'& .line': {
		position: 'absolute',
		left: 0,
		bottom: '-10px',
		width: '100%',
		height: '16px',
		color: 'var(--pen-red)',
	},
	'& p': {
		fontFamily: 'var(--font-note)',
		fontSize: '1.2rem',
		color: 'var(--ink-soft)',
	},
})
