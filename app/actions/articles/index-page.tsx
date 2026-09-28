import { css } from 'remix/ui'
import type { Handle } from 'remix/ui'

import type { ArticleMeta } from '../../content/articles.ts'
import { routes } from '../../routes.ts'
import { ArticleCard } from '../../ui/article-card.tsx'
import { Scribble } from '../../ui/icons.tsx'
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
					<p className="eyebrow">The bookshop</p>
					<h1>
						Articles
						<Scribble className="scribble line" seed={14} />
					</h1>
					<p className="count">{articles.length} on the shelf. Some of them are even finished.</p>
				</header>
				{articles.length ? (
					<div mix={listStyle}>
						{articles.map((article, index) => (
							<ArticleCard key={article.slug} article={article} index={index} />
						))}
					</div>
				) : (
					<p>The shelves are empty. Check back soon!</p>
				)}
			</Layout>
		)
	}
}

const headerStyle = css({
	display: 'grid',
	gap: '10px',
	marginBottom: '36px',
	'& .eyebrow': {
		fontFamily: 'var(--font-sign)',
		fontWeight: 800,
		fontSize: '0.78rem',
		letterSpacing: '0.1em',
		textTransform: 'uppercase',
		color: 'var(--accent)',
	},
	'& h1': {
		position: 'relative',
		width: 'fit-content',
		fontFamily: 'var(--font-hand)',
		fontWeight: 400,
		fontSize: 'clamp(2.8rem, 9vw, 4.4rem)',
		lineHeight: 1,
	},
	'& .line': { position: 'absolute', left: 0, bottom: '-8px', width: '100%', height: '10px' },
	'& .count': { color: 'var(--ink-soft)', marginTop: '8px' },
})

const listStyle = css({ display: 'grid', gap: '22px' })
