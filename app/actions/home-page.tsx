import { css } from 'remix/ui'
import type { Handle } from 'remix/ui'

import type { ArticleMeta } from '../content/articles.ts'
import { routes } from '../routes.ts'
import { ArticleCard } from '../ui/article-card.tsx'
import { Layout } from '../ui/layout.tsx'
import { Room } from '../ui/public/room.tsx'
import { site } from '../ui/site.ts'

export function HomePage(handle: Handle<{ articles: ArticleMeta[] }>) {
	return () => {
		let { articles } = handle.props
		let latest = articles.slice(0, 3)
		return (
			<Layout current="home" path={routes.home.href()}>
				<section mix={heroStyle}>
					<p className="eyebrow">
						<span className="dot" aria-hidden="true" /> Player 1 has entered the game
					</p>
					<h1>
						Samuel <span className="accent">Jensen</span>
					</h1>
					<p className="lede">
						Hi there, I'm Sam. You can call me Sam.
						<br />
						Oh, and this is my website by the way. Come on in and look around.
					</p>
				</section>

				<Room
					articlesHref={routes.articles.index.href()}
					latest={latest.map((article) => ({
						title: article.title,
						href: routes.articles.show.href({ slug: article.slug }),
					}))}
					github={site.social.github}
					linkedin={site.social.linkedin}
				/>

				{latest.length > 0 && (
					<section mix={latestStyle} aria-labelledby="latest-heading">
						<div className="heading">
							<h2 id="latest-heading">Latest writing</h2>
							<a href={routes.articles.index.href()}>All articles ▶</a>
						</div>
						<div className="list">
							{latest.map((article, index) => (
								<ArticleCard key={article.slug} article={article} index={index} />
							))}
						</div>
					</section>
				)}
			</Layout>
		)
	}
}

const heroStyle = css({
	display: 'grid',
	gap: '14px',
	marginBottom: '36px',
	'& .eyebrow': {
		display: 'flex',
		alignItems: 'center',
		gap: '10px',
		fontFamily: 'var(--font-label)',
		fontSize: '0.8rem',
		color: 'var(--ink-soft)',
	},
	'& .dot': {
		width: '10px',
		height: '10px',
		background: 'var(--green)',
		boxShadow: '0 0 0 2px var(--line)',
		animation: 'hero-blink 1s steps(1) infinite',
	},
	'& h1': {
		fontFamily: 'var(--font-display)',
		fontSize: 'clamp(2.75rem, 9vw, 5.5rem)',
		fontWeight: 700,
		lineHeight: 0.95,
		letterSpacing: '-0.01em',
		textShadow: '4px 4px 0 var(--gold)',
	},
	'& h1 .accent': {
		color: 'var(--accent)',
		textShadow: '4px 4px 0 var(--line)',
	},
	'& .lede': {
		maxWidth: '38rem',
		fontSize: '1.1rem',
		color: 'var(--ink-soft)',
	},
	'@keyframes hero-blink': {
		'50%': { opacity: 0.2 },
	},
})

const latestStyle = css({
	marginTop: '64px',
	display: 'grid',
	gap: '20px',
	'& .heading': {
		display: 'flex',
		alignItems: 'baseline',
		justifyContent: 'space-between',
		gap: '16px',
	},
	'& h2': {
		fontFamily: 'var(--font-display)',
		fontSize: '1.75rem',
		fontWeight: 700,
	},
	'& .heading a': {
		fontFamily: 'var(--font-label)',
		fontSize: '0.8rem',
		textDecoration: 'none',
		color: 'var(--accent)',
	},
	'& .heading a:hover': {
		textDecoration: 'underline',
		textDecorationThickness: '2px',
	},
	'& .list': {
		display: 'grid',
		gap: '20px',
	},
})
