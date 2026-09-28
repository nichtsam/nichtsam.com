export interface Project {
	slug: string
	title: string
	year: string
	/** One line for cards and descriptions. */
	summary: string
	stack: string[]
	links: Array<{ label: string; href: string }>
	/** Paragraphs for the project page. */
	body: string[]
}

// Placeholder copy is marked as such; Sam fills in the real story.
const projects: Project[] = [
	{
		slug: 'nichtsam-com',
		title: 'nichtsam.com',
		year: '2026',
		summary: 'This website: a page drawn in pencil, built with Remix 3.',
		stack: ['Remix 3', 'TypeScript', 'SVG'],
		links: [{ label: 'Source on GitHub', href: 'https://github.com/nichtsam/nichtsam.com' }],
		body: [
			'Every frame, line and drawing here is generated on the server by a small seeded pencil, then drawn in as you scroll. Pages are plain server-rendered HTML; the pencil work is layered on top.',
			'Placeholder: why it was built, how the drawing works, and what was hard.',
		],
	},
]

export function listProjects() {
	return projects
}

export function getProject(slug: string) {
	return projects.find((project) => project.slug === slug)
}
