import { createHash } from 'node:crypto'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { contentSecurityPolicy } from '@nichtsam/helmet/rules/content/content-security-policy'

// Prerendered pages can't carry a per-request nonce, so each page allows
// exactly its own inline scripts by hash instead
export async function addContentSecurityPolicy(clientBuildDirectory: string) {
	const pages = (
		await readdir(clientBuildDirectory, { recursive: true })
	).filter((file) => file.endsWith('.html'))

	if (pages.length === 0) {
		throw new Error(`No prerendered pages in ${clientBuildDirectory}`)
	}

	for (const page of pages) {
		const file = path.join(clientBuildDirectory, page)
		const html = await readFile(file, 'utf8')
		await writeFile(file, withPolicy(html, page))
	}
}

// Right after the charset, which must stay in the first bytes of the page,
// and before any script, which the policy only covers once it's parsed
const anchor = '<meta charSet="utf-8"/>'
const inlineScript = /<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/g

function withPolicy(html: string, page: string) {
	const anchorIndex = html.indexOf(anchor)
	const firstScriptIndex = html.indexOf('<script')
	if (
		anchorIndex === -1 ||
		(firstScriptIndex !== -1 && firstScriptIndex < anchorIndex)
	) {
		throw new Error(`Can't place the CSP before the scripts of ${page}`)
	}

	const hashes = Array.from(
		html.matchAll(inlineScript),
		([, script = '']) =>
			`'sha256-${createHash('sha256').update(script).digest('base64')}'`,
	)
	const meta = `<meta http-equiv="Content-Security-Policy" content="${policy(hashes)}"/>`

	return html.replace(anchor, anchor + meta)
}

function policy(scriptHashes: string[]) {
	const headers = new Headers()
	contentSecurityPolicy(headers, {
		directives: {
			fetch: {
				'connect-src': ["'self'"],
				'font-src': ["'self'"],
				'frame-src': ["'self'"],
				'img-src': ["'self'", 'data:', 'res.cloudinary.com'],
				'script-src': [
					"'strict-dynamic'",
					"'self'",
					...scriptHashes,
					"'unsafe-inline'", // backward compatibility for hashes
					'https:', // backward compatibility for 'strict-dynamic'
					"'unsafe-eval'", // mdx-bundler needs this
				],
			},
			navigation: {
				'form-action': ["'self'"],
				// Ignored in a meta policy, it has to be a response header
				'frame-ancestors': undefined,
			},
		},
	})

	return headers.get('Content-Security-Policy')
}
