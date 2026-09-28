import { css } from 'remix/ui'
import type { Handle } from 'remix/ui'

import type { ArticleMeta } from '../content/articles.ts'
import type { Project } from '../content/projects.ts'
import { absoluteUrl, site } from '../content/site.ts'
import type { Theme } from '../middleware/theme.ts'
import { routes } from '../routes.ts'
import { SectionHeading } from '../ui/headings.tsx'
import { Layout } from '../ui/layout.tsx'
import { ArticleList, ProjectTiles } from '../ui/lists.tsx'
import { Hero, type HeroSlide } from '../ui/public/hero.tsx'
import { Doodle } from '../ui/public/sketch.tsx'

export interface HomePageProps {
	articles: ArticleMeta[]
	projects: Project[]
	theme: Theme | null
}

export function personJsonLd() {
	return {
		'@context': 'https://schema.org',
		'@type': 'Person',
		name: site.author,
		alternateName: site.name,
		url: absoluteUrl('/'),
		sameAs: [site.social.github, site.social.linkedin],
	}
}

export function HomePage(handle: Handle<HomePageProps>) {
	return () => {
		let { articles, projects, theme } = handle.props
		let latest = articles[0]
		let slides: HeroSlide[] = [
			{
				id: 'hello',
				heading: "Hi, I'm Sam.\nI make things\nfor the web.",
				body: 'You can call me Sam. Oh, and this is my website, by the way.',
				link: { href: routes.about.href(), label: 'More about me →' },
				art: 'desk',
				artLabel: 'A desk with a lamp, a monitor showing code, a stack of books and a mug.',
			},
			{
				id: 'writing',
				heading: 'I write,\nsometimes.',
				body: 'Notes on Git, CSS, and whatever I broke this week.',
				link: latest
					? {
							href: routes.articles.show.href({ slug: latest.slug }),
							label: `Latest: ${latest.title} →`,
						}
					: { href: routes.articles.index.href(), label: 'Read the articles →' },
				art: 'book',
				artLabel: 'An open notebook with a pencil and a note.',
			},
			{
				id: 'building',
				heading: 'I build\nsmall things.',
				body: 'Tools, experiments, and this very website.',
				link: { href: routes.projects.index.href(), label: 'See the projects →' },
				art: 'browser',
				artLabel: 'A browser window being sketched, with a ruler leaning on it.',
			},
		]

		return (
			<Layout meta={{ path: routes.home.href(), jsonLd: personJsonLd() }} section="home">
				<Hero slides={slides} lampValue={theme === 'dark' ? 'light' : 'dark'} />

				<section aria-labelledby="about" mix={sectionStyle}>
					<SectionHeading id="about" seed={31}>
						About me
					</SectionHeading>
					<div className="columns">
						<div>
							<p data-ink>
								A web developer who likes small tools, tidy layouts and drawing in the margins.
							</p>
							<p className="soft" data-ink style="--d: 150ms">
								Placeholder: a sentence or two about what Sam works on.
							</p>
							<p data-ink style="--d: 300ms">
								<a className="pencil-link" href={routes.about.href()}>
									The whole story →
								</a>
							</p>
						</div>
						<ul className="facts">
							{['Currently: placeholder', 'Likes: placeholder', 'Based in: placeholder'].map(
								(fact, i) => (
									<li key={fact} data-ink style={`--d: ${100 + i * 100}ms`}>
										<Doodle name="bullet" ink={false} />
										<span>{fact}</span>
									</li>
								),
							)}
						</ul>
					</div>
				</section>

				<section aria-labelledby="projects" mix={sectionStyle}>
					<SectionHeading id="projects" seed={32}>
						Projects
					</SectionHeading>
					<ProjectTiles projects={projects} />
				</section>

				<section aria-labelledby="articles" mix={sectionStyle}>
					<SectionHeading id="articles" seed={33}>
						Articles
					</SectionHeading>
					<ArticleList articles={articles.slice(0, 5)} />
					<p className="more" data-ink>
						<a className="pencil-link" href={routes.articles.index.href()}>
							All articles →
						</a>
					</p>
				</section>
			</Layout>
		)
	}
}

const sectionStyle = css({
	marginTop: 'clamp(4rem, 2.5rem + 5vw, 6.5rem)',
	'& .columns': {
		display: 'grid',
		gridTemplateColumns: 'minmax(0, 1fr)',
		gap: '1.5rem 3.5rem',
	},
	'& .columns p + p': { marginTop: '0.75rem' },
	'& .soft': { color: 'var(--ink-soft)' },
	'& .facts': { padding: 0, listStyle: 'none' },
	'& .facts li': { display: 'flex', alignItems: 'baseline', gap: '0.75rem' },
	'& .facts li + li': { marginTop: '0.4rem' },
	'& .facts svg': { flex: 'none', width: '14px', height: '14px', transform: 'translateY(2px)' },
	'& .more': { marginTop: '1.5rem' },
	'@media (min-width: 48rem)': {
		'& .columns': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
	},
})
