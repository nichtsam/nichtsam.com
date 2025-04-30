import { isValidElement, type ReactNode } from 'react'
import { type UIMatch, useMatches } from 'react-router'
import { z } from 'zod'

const breadcrumbSchema = z.custom<
	Exclude<ReactNode, boolean | null | undefined>
>((data) => !!data && (isValidElement(data) || typeof data !== 'object'))
const breadcrumbHandleSchema = z.object({ breadcrumb: breadcrumbSchema })
const breadcrumbMatchSchema = z.object({
	handle: breadcrumbHandleSchema,
})

export type BreadcrumbHandle = z.infer<typeof breadcrumbHandleSchema>

interface BreadcrumbsOptions {
	skip?: number
	minBreadcrumbs?: number
}

type Breadcrumb = {
	id: string
	pathname: string
	breadcrumb: ReactNode
}

export const useBreadcrumbs = (args?: BreadcrumbsOptions) => {
	const matches = useMatches()
	return matchesToBreadcrumbs(matches, args)
}

export const matchesToBreadcrumbs = (
	matches: UIMatch[],
	{ skip = 0, minBreadcrumbs = 0 }: BreadcrumbsOptions = {},
): Breadcrumb[] => {
	const breadcrumbs = []

	let skipped = 0
	for (let i = 0; i < matches.length; i += 1) {
		const match = matches[i]!

		const result = breadcrumbMatchSchema.safeParse(match)

		if (!result.success) {
			continue
		}

		if (skipped < skip) {
			skipped += 1
			continue
		}

		breadcrumbs.push({
			id: match.id,
			pathname: match.pathname,
			breadcrumb: result.data.handle.breadcrumb,
		})
	}

	if (breadcrumbs.length < minBreadcrumbs) {
		return []
	}

	return breadcrumbs
}
