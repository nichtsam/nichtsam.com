import { existsSync, statSync } from 'node:fs'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { type Meta } from '../model.ts'
import { type MdxSource } from './bundler.server.ts'

export async function getMdxSource(meta: Meta): Promise<MdxSource> {
	const filepath = path.resolve(meta.contentDir, meta.dir, meta.base)
	const source = await readFile(filepath, 'utf-8')

	const hasFiles = meta.dir !== '.'

	if (!hasFiles) {
		return {
			source,
		}
	}

	const dirPath = path.resolve(meta.contentDir, meta.dir)
	const files = await getFilesInDirectory(dirPath)

	return {
		source,
		files,
	}
}

type Files = Record<string, string>
async function getFilesInDirectory(
	dirPath: string,
	rootPath: string = dirPath,
): Promise<Record<string, string>> {
	if (!existsSync(dirPath)) {
		return {}
	}

	if (statSync(dirPath).isFile()) {
		const relativePath = path.relative(rootPath, dirPath)

		return {
			[relativePath]: await readFile(dirPath, 'utf-8'),
		}
	} else {
		const dir = await readdir(dirPath, { withFileTypes: true })

		const fileSets = await Promise.all(
			dir.map((dirent) =>
				getFilesInDirectory(
					path.resolve(dirent.parentPath, dirent.name),
					rootPath,
				),
			),
		)

		const files = fileSets.reduce<Files>((acc, files) => {
			return Object.assign(acc, files)
		}, {})

		return files
	}
}
