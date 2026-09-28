import { css } from 'remix/ui'
import type { Handle } from 'remix/ui'

import type { ArticleMeta } from '../content/articles.ts'
import { routes } from '../routes.ts'
import { ArticleCard } from '../ui/article-card.tsx'
import { Icon, Scribble, type IconName } from '../ui/icons.tsx'
import { Layout } from '../ui/layout.tsx'
import { SceneControls } from '../ui/public/scene-controls.tsx'
import { site } from '../ui/site.ts'
import { SAM_LINES, SCENE_ID, StreetScene } from '../ui/street-scene.tsx'

export function HomePage(handle: Handle<{ articles: ArticleMeta[] }>) {
	return () => {
		let latest = handle.props.articles.slice(0, 3)
		let places: Array<{
			icon: IconName
			title: string
			text: string
			href: string
			external?: boolean
		}> = [
			{
				icon: 'book',
				title: 'The bookshop',
				text: 'everything I have written',
				href: routes.articles.index.href(),
			},
			{
				icon: 'wrench',
				title: 'The workshop',
				text: 'code & experiments on GitHub',
				href: site.social.github,
				external: true,
			},
			{
				icon: 'briefcase',
				title: 'The tower',
				text: 'the serious me, on LinkedIn',
				href: site.social.linkedin,
				external: true,
			},
			{
				icon: 'house',
				title: "Sam's house",
				text: 'knock on the door up there',
				href: `#${SCENE_ID}`,
			},
		]
		return (
			<Layout
				current="home"
				path={routes.home.href()}
				wide={
					<section mix={heroStyle} aria-label="Sam's street">
						<StreetScene />
						<SceneControls sceneId={SCENE_ID} lines={SAM_LINES} />
						<p className="hint">
							hover the buildings · click the windows · knock on the little house
						</p>
					</section>
				}
			>
				<section mix={introStyle} aria-labelledby="intro-heading">
					<h1 id="intro-heading">
						Hi there, I'm Sam.
						<Scribble className="scribble line" seed={9} />
					</h1>
					<p className="lede">
						You can call me Sam. Oh, and this is my website by the way. It's a small street I drew:
						every building leads somewhere.
					</p>
				</section>

				<section mix={sectionStyle} aria-labelledby="places-heading">
					<h2 id="places-heading">What's on this street</h2>
					<ul className="places">
						{places.map((place, i) => (
							<li key={place.title}>
								<a
									href={place.href}
									className="place frame frame-hover"
									target={place.external ? '_blank' : undefined}
									rel={place.external ? 'noreferrer' : undefined}
								>
									<Icon name={place.icon} seed={40 + i} />
									<span className="title">{place.title}</span>
									<span className="text">{place.text}</span>
								</a>
							</li>
						))}
					</ul>
				</section>

				{latest.length > 0 && (
					<section mix={sectionStyle} aria-labelledby="latest-heading">
						<div className="heading">
							<h2 id="latest-heading">Fresh from the bookshop</h2>
							<a href={routes.articles.index.href()}>all articles →</a>
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
	position: 'relative',
	marginTop: '-12px',
	'& .hint': {
		textAlign: 'center',
		fontFamily: 'var(--font-hand)',
		fontSize: '1rem',
		color: 'var(--ink-soft)',
		marginTop: '4px',
		paddingInline: '20px',
	},
})

const introStyle = css({
	display: 'grid',
	gap: '14px',
	maxWidth: '44rem',
	'& h1': {
		position: 'relative',
		width: 'fit-content',
		fontFamily: 'var(--font-hand)',
		fontWeight: 400,
		fontSize: 'clamp(2.4rem, 7vw, 3.8rem)',
		lineHeight: 1.1,
	},
	'& .line': { position: 'absolute', left: 0, bottom: '-6px', width: '100%', height: '10px' },
	'& .lede': { fontSize: '1.15rem', color: 'var(--ink-soft)' },
})

const sectionStyle = css({
	display: 'grid',
	gap: '18px',
	marginTop: '56px',
	'& h2': {
		fontFamily: 'var(--font-hand)',
		fontWeight: 400,
		fontSize: 'clamp(1.7rem, 4vw, 2.1rem)',
		lineHeight: 1.2,
	},
	'& .heading': {
		display: 'flex',
		alignItems: 'baseline',
		justifyContent: 'space-between',
		gap: '16px',
	},
	'& .heading a': {
		fontFamily: 'var(--font-sign)',
		fontWeight: 800,
		fontSize: '0.78rem',
		letterSpacing: '0.08em',
		textTransform: 'uppercase',
		textDecoration: 'none',
	},
	'& .heading a:hover': { color: 'var(--accent)' },
	'& .places': {
		display: 'grid',
		gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
		gap: '18px',
		listStyle: 'none',
		padding: 0,
	},
	'& .place': {
		display: 'grid',
		justifyItems: 'center',
		gap: '4px',
		height: '100%',
		padding: '14px 10px 12px',
		textAlign: 'center',
		textDecoration: 'none',
		transition: 'transform 180ms ease',
	},
	'& .place:hover': { transform: 'rotate(-1deg) translateY(-3px)' },
	'& .place svg': { width: '52px', height: '52px' },
	'& .place .title': { fontFamily: 'var(--font-hand)', fontSize: '1.25rem' },
	'& .place .text': { fontSize: '0.9rem', color: 'var(--ink-soft)', lineHeight: 1.4 },
	'& .list': { display: 'grid', gap: '22px' },
	'@media (max-width: 760px)': {
		'& .places': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
	},
})
