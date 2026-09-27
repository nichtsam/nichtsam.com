import * as fs from 'node:fs/promises'
import * as path from 'node:path'

import { Marked, type Tokens } from 'marked'
import { createHighlighter } from 'shiki'
import { parse as parseYaml } from 'yaml'

export interface ArticleMeta {
	slug: string
	title: string
	description: string
	publishedDate: string
	keywords: string[]
	draft: boolean
	readingMinutes: number
}

export interface Article extends ArticleMeta {
	html: string
	headings: Array<{ depth: number; text: string; id: string }>
}

const ARTICLES_DIR = path.resolve(process.cwd(), 'content/articles')
const SHIKI_LANGS = ['html', 'css', 'sh', 'ts', 'tsx', 'js', 'json', 'log']

const highlighter = await createHighlighter({
	themes: ['github-light', 'github-dark'],
	langs: SHIKI_LANGS,
})

export function slugify(text: string) {
	return text
		.toLowerCase()
		.replace(/<[^>]+>/g, '')
		.replace(/[^\p{L}\p{N}\s-]/gu, '')
		.trim()
		.replace(/\s+/g, '-')
}

function parseFrontmatter(source: string) {
	let match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(source)
	if (!match) return { data: {} as Record<string, unknown>, body: source }
	return {
		data: (parseYaml(match[1]!) ?? {}) as Record<string, unknown>,
		body: source.slice(match[0].length),
	}
}

function toMeta(slug: string, data: Record<string, unknown>, body: string): ArticleMeta {
	let words = body.split(/\s+/).filter(Boolean).length
	let date = data.publishedDate
	return {
		slug,
		title: String(data.title ?? slug),
		description: String(data.description ?? '').trim(),
		publishedDate: date instanceof Date ? date.toISOString().slice(0, 10) : String(date ?? ''),
		keywords: Array.isArray(data.keywords) ? data.keywords.map(String) : [],
		draft: data.draft === true,
		readingMinutes: Math.max(1, Math.round(words / 220)),
	}
}

function renderMarkdown(body: string) {
	let headings: Article['headings'] = []
	let marked = new Marked({
		gfm: true,
		renderer: {
			heading({ tokens, depth }: Tokens.Heading) {
				let text = this.parser.parseInline(tokens)
				let id = slugify(text)
				headings.push({ depth, text: text.replace(/<[^>]+>/g, ''), id })
				return `<h${depth} id="${id}"><a class="anchor" href="#${id}">${text}</a></h${depth}>\n`
			},
			code({ text, lang }: Tokens.Code) {
				let language = lang && SHIKI_LANGS.includes(lang) ? lang : 'text'
				let highlighted = highlighter.codeToHtml(text, {
					lang: language,
					themes: { light: 'github-light', dark: 'github-dark' },
					defaultColor: false,
				})
				let label = lang && lang !== 'plain' ? lang : 'text'
				return `<figure class="code-block"><figcaption>${label}</figcaption>${highlighted}</figure>\n`
			},
			link({ href, title, tokens }: Tokens.Link) {
				let text = this.parser.parseInline(tokens)
				let external = /^https?:\/\//.test(href)
				let attrs = external ? ' target="_blank" rel="noreferrer"' : ''
				let titleAttr = title ? ` title="${title}"` : ''
				return `<a href="${href}"${titleAttr}${attrs}>${text}</a>`
			},
		},
	})
	// The page renders the title itself, so drop a leading H1 from the body.
	let withoutTitle = body.replace(/^\s*#\s+.*\r?\n/, '')
	let html = marked.parse(withoutTitle, { async: false })
	return { html, headings }
}

async function loadArticle(file: string): Promise<Article> {
	let slug = file.replace(/\.mdx?$/, '')
	let source = await fs.readFile(path.join(ARTICLES_DIR, file), 'utf8')
	let { data, body } = parseFrontmatter(source)
	return { ...toMeta(slug, data, body), ...renderMarkdown(body) }
}

async function loadAll() {
	let files = (await fs.readdir(ARTICLES_DIR)).filter(
		(file) => /\.mdx?$/.test(file) && !file.startsWith('_'),
	)
	let articles = await Promise.all(files.map(loadArticle))
	let includeDrafts = process.env.NODE_ENV === 'development'
	return articles
		.filter((article) => includeDrafts || !article.draft)
		.sort((a, b) => b.publishedDate.localeCompare(a.publishedDate))
}

let cache: Promise<Article[]> | undefined

function getAll() {
	// Re-read on every request in development so edits show up without a restart.
	if (process.env.NODE_ENV === 'development' || !cache) cache = loadAll()
	return cache
}

export async function listArticles(): Promise<ArticleMeta[]> {
	return (await getAll()).map(({ html: _html, headings: _headings, ...meta }) => meta)
}

export async function getArticle(slug: string) {
	return (await getAll()).find((article) => article.slug === slug)
}

export function formatDate(isoDate: string) {
	let date = new Date(`${isoDate}T00:00:00Z`)
	if (Number.isNaN(date.getTime())) return isoDate
	return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', timeZone: 'UTC' })
}
