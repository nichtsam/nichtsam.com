import { type CollectionEntry, getCollection } from 'astro:content'

export type Project = CollectionEntry<'projects'>

export async function getProjects() {
	const projects = await getCollection('projects')

	return projects.sort((a, b) => b.data.startedYear - a.data.startedYear)
}
