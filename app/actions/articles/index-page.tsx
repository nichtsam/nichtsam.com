import type { Handle } from 'remix/ui'

import type { ArticleMeta } from '../../content/articles.ts'
import { routes } from '../../routes.ts'
import { PageHeader } from '../../ui/headings.tsx'
import { Layout } from '../../ui/layout.tsx'
import { ArticleList } from '../../ui/lists.tsx'

export function ArticlesIndexPage(handle: Handle<{ articles: ArticleMeta[] }>) {
	return () => {
		let { articles } = handle.props
		return (
			<Layout
				meta={{
					title: 'Articles',
					description: 'Notes and write-ups on Git, CSS and building for the web.',
					path: routes.articles.index.href(),
				}}
				section="articles"
			>
				<PageHeader
					title="Articles"
					eyebrow="notes and write-ups"
					lede={`${articles.length} so far. Some of them are even finished.`}
					seed={74}
				/>
				<ArticleList articles={articles} headingLevel={2} />
			</Layout>
		)
	}
}
