import type { Handle } from 'remix/ui'

import type { Project } from '../../content/projects.ts'
import { routes } from '../../routes.ts'
import { PageHeader } from '../../ui/headings.tsx'
import { Layout } from '../../ui/layout.tsx'
import { ProjectTiles } from '../../ui/lists.tsx'

export function ProjectsIndexPage(handle: Handle<{ projects: Project[] }>) {
	return () => (
		<Layout
			meta={{
				title: 'Projects',
				description: 'Things Sam has built, and things that are still on the workbench.',
				path: routes.projects.index.href(),
			}}
			section="projects"
		>
			<PageHeader
				title="Projects"
				eyebrow="things I have built"
				lede="Some finished, some still on the workbench."
				seed={72}
			/>
			<ProjectTiles projects={handle.props.projects} headingLevel={2} />
		</Layout>
	)
}
