import { createController } from 'remix/router'

import { getProject, listProjects } from '../../content/projects.ts'
import { routes } from '../../routes.ts'
import { pageHeaders } from '../headers.ts'
import { NotFoundPage } from '../not-found-page.tsx'
import { ProjectsIndexPage } from './index-page.tsx'
import { ProjectPage } from './show-page.tsx'

export default createController(routes.projects, {
	actions: {
		index(context) {
			return context.render(<ProjectsIndexPage projects={listProjects()} />, {
				headers: pageHeaders,
			})
		},
		show(context) {
			let project = getProject(context.params.slug)
			if (!project) {
				return context.render(<NotFoundPage pathname={context.url.pathname} />, { status: 404 })
			}
			return context.render(<ProjectPage project={project} />, { headers: pageHeaders })
		},
	},
})
