import { css } from 'remix/ui'

import { site } from '../content/site.ts'
import { routes } from '../routes.ts'
import { PageHeader } from '../ui/headings.tsx'
import { Layout } from '../ui/layout.tsx'
import { personJsonLd } from './home-page.tsx'

export function AboutPage() {
	return () => (
		<Layout
			meta={{
				title: 'About',
				description: 'Who Sam is, what he works on, and where else to find him.',
				path: routes.about.href(),
				jsonLd: personJsonLd(),
			}}
			section="about"
		>
			<PageHeader
				title="Hi there, I'm Sam."
				eyebrow="the long version"
				lede="You can call me Sam. Oh, and this is my website by the way."
				seed={71}
			/>
			<div className="prose" mix={aboutStyle}>
				<h2 data-ink>What I do</h2>
				<p className="placeholder" data-ink>
					Placeholder: a few paragraphs about what Sam works on and what he cares about.
				</p>
				<h2 data-ink>Things I like</h2>
				<p className="placeholder" data-ink>
					Placeholder: tools, books, hobbies.
				</p>
				<h2 data-ink>Elsewhere</h2>
				<p data-ink>
					<a href={site.social.github} rel="me noreferrer">
						GitHub
					</a>
					{' · '}
					<a href={site.social.linkedin} rel="me noreferrer">
						LinkedIn
					</a>
				</p>
			</div>
		</Layout>
	)
}

const aboutStyle = css({
	'& .placeholder': { fontFamily: 'var(--font-hand)', color: 'var(--ink-soft)' },
})
