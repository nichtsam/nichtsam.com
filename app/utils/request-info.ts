import { useRouteLoaderData } from '@remix-run/react'
import { type loader as rootLoader } from '#app/root.tsx'

export function useRequestInfo() {
	const data = useRouteLoaderData<typeof rootLoader>('root')
	if (!data?.requestInfo) {
		throw new Error('No requestInfo found in root loader')
	}

	return data.requestInfo
}

export const useHints = () => {
	const requestInfo = useRequestInfo()
	return requestInfo.hints
}
