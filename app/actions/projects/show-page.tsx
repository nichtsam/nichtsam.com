import { css } from 'remix/ui'
import type { Handle } from 'remix/ui'

import type { Project } from '../../content/projects.ts'
import { routes } from '../../routes.ts'
import { PageHeader } from '../../ui/headings.tsx'
import { Layout } from '../../ui/layout.tsx'

export function ProjectPage(handle: Handle<{ project: Project }>) {
	return () => {
		let { project } = handle.props
		return (
			<Layout
				meta={{
					title: project.title,
					description: project.summary,
					path: routes.projects.show.href({ slug: project.slug }),
				}}
				section="projects"
			>
				<PageHeader
					title={project.title}
					eyebrow={[project.year, ...project.stack].join(' · ')}
					lede={project.summary}
					seed={73}
				/>
				<div className="prose" mix={projectStyle}>
					{project.body.map((paragraph, i) => (
						<p key={i} data-ink style={`--d: ${i * 100}ms`}>
							{paragraph}
						</p>
					))}
					{project.links.length ? (
						<ul className="links">
							{project.links.map((link) => (
								<li key={link.href} data-ink>
									<a href={link.href} rel="noreferrer">
										{link.label}
									</a>
								</li>
							))}
						</ul>
					) : null}
					<p data-ink>
						<a href={routes.projects.index.href()}>← All projects</a>
					</p>
				</div>
			</Layout>
		)
	}
}

const projectStyle = css({
	'& .links': { paddingLeft: '1.2em' },
})
