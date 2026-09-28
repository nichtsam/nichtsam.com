import { css, unsafeHTML } from 'remix/ui'
import type { Handle } from 'remix/ui'

import { formatDate, type Article, type ArticleMeta } from '../../content/articles.ts'
import { absoluteUrl, site } from '../../content/site.ts'
import { routes } from '../../routes.ts'
import { PageHeader } from '../../ui/headings.tsx'
import { Layout } from '../../ui/layout.tsx'

export interface ArticlePageProps {
	article: Article
	newer?: ArticleMeta
	older?: ArticleMeta
}

export function ArticlePage(handle: Handle<ArticlePageProps>) {
	return () => {
		let { article, newer, older } = handle.props
		let path = routes.articles.show.href({ slug: article.slug })
		return (
			<Layout
				meta={{
					title: article.title,
					description: article.description,
					path,
					type: 'article',
					publishedTime: article.publishedDate,
					jsonLd: {
						'@context': 'https://schema.org',
						'@type': 'BlogPosting',
						headline: article.title,
						description: article.description,
						datePublished: article.publishedDate,
						keywords: article.keywords.join(', '),
						url: absoluteUrl(path),
						author: { '@type': 'Person', name: site.author, url: absoluteUrl('/') },
					},
				}}
				section="articles"
			>
				<article mix={articleStyle}>
					<PageHeader
						title={article.title}
						eyebrow={
							<>
								<time dateTime={article.publishedDate}>{formatDate(article.publishedDate)}</time> ·{' '}
								{article.readingMinutes} min read
							</>
						}
						lede={article.description || undefined}
						seed={75}
					/>
					<div className="prose" innerHTML={unsafeHTML(article.html)} />
				</article>
				{newer || older ? (
					<nav aria-label="More articles" mix={pagerStyle}>
						{older ? (
							<a className="older" href={routes.articles.show.href({ slug: older.slug })}>
								<span className="label">← Older</span>
								<span>{older.title}</span>
							</a>
						) : null}
						{newer ? (
							<a className="newer" href={routes.articles.show.href({ slug: newer.slug })}>
								<span className="label">Newer →</span>
								<span>{newer.title}</span>
							</a>
						) : null}
					</nav>
				) : null}
			</Layout>
		)
	}
}

const articleStyle = css({
	'& .prose': { marginTop: '0.5rem' },
})

const pagerStyle = css({
	display: 'grid',
	gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 14rem), 1fr))',
	gap: '1rem 2rem',
	maxWidth: 'var(--measure)',
	marginTop: 'clamp(3rem, 2rem + 3vw, 4.5rem)',
	'& a': { display: 'block' },
	'& .label': { display: 'block', fontSize: 'var(--step--1)', color: 'var(--ink-soft)' },
	'& a:hover span:last-child': { color: 'var(--accent)' },
	'& .newer': { textAlign: 'right' },
	'& .newer:only-child': { gridColumn: '-2' },
})
