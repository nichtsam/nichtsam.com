import { css } from 'remix/ui'
import type { Handle } from 'remix/ui'

import type { ArticleMeta } from '../content/articles.ts'
import { routes } from '../routes.ts'
import { ArticleCard } from '../ui/article-card.tsx'
import { Layout } from '../ui/layout.tsx'
import { Arrow } from '../ui/public/doodles.tsx'
import { Sketchpad } from '../ui/public/sketchpad.tsx'
import { StickyNotes } from '../ui/public/sticky-notes.tsx'
import { site } from '../ui/site.ts'

export function HomePage(handle: Handle<{ articles: ArticleMeta[] }>) {
	return () => {
		let latest = handle.props.articles.slice(0, 3)
		return (
			<Layout current="home" path={routes.home.href()}>
				<Sketchpad />

				<section mix={sectionStyle} aria-labelledby="desk-heading">
					<h2 id="desk-heading">
						stuff on my desk
						<Arrow className="arrow boil" />
					</h2>
					<StickyNotes
						articlesHref={routes.articles.index.href()}
						github={site.social.github}
						linkedin={site.social.linkedin}
					/>
				</section>

				{latest.length > 0 && (
					<section mix={sectionStyle} aria-labelledby="latest-heading">
						<div className="heading">
							<h2 id="latest-heading">latest scribbles</h2>
							<a href={routes.articles.index.href()}>see all →</a>
						</div>
						<div>
							{latest.map((article) => (
								<ArticleCard key={article.slug} article={article} />
							))}
						</div>
					</section>
				)}
			</Layout>
		)
	}
}

const sectionStyle = css({
	display: 'grid',
	gap: '18px',
	marginTop: '48px',
	'& h2': {
		position: 'relative',
		width: 'fit-content',
		fontFamily: 'var(--font-hand)',
		fontSize: 'clamp(2.2rem, 5vw, 2.8rem)',
		fontWeight: 700,
		lineHeight: 1,
		transform: 'rotate(-1.5deg)',
	},
	'& h2 .arrow': {
		position: 'absolute',
		left: '100%',
		top: '40%',
		width: '70px',
		height: '46px',
		marginLeft: '8px',
		color: 'var(--pen-blue)',
	},
	'& .heading': {
		display: 'flex',
		alignItems: 'baseline',
		justifyContent: 'space-between',
		gap: '16px',
	},
	'& .heading a': {
		fontFamily: 'var(--font-hand)',
		fontSize: '1.5rem',
		fontWeight: 700,
		color: 'var(--pen-red)',
		textDecoration: 'none',
	},
	'& .heading a:hover': { textDecoration: 'underline wavy' },
})
