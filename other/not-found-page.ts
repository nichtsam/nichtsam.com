import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { createRequestHandler, type ServerBuild } from 'react-router'

// Prerendering only accepts pages that answer with a 200, so the page served
// for unknown URLs is rendered from the server build instead
export async function addNotFoundPage({
	buildDirectory,
	serverBuildFile,
}: {
	buildDirectory: string
	serverBuildFile: string
}) {
	const build = (await import(
		/* @vite-ignore */
		pathToFileURL(path.join(buildDirectory, 'server', serverBuildFile)).href
	)) as ServerBuild
	const response = await createRequestHandler(build)(
		new Request('http://localhost/404'),
	)

	if (response.status !== 404) {
		throw new Error(`The not found page answered with a ${response.status}`)
	}

	await writeFile(
		path.join(buildDirectory, 'client', '404.html'),
		await response.text(),
	)
}
