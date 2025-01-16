import { useRouteLoaderData } from 'react-router'
import { type loader as rootLoader } from '#app/root.tsx'

export function useRequestInfo() {
	const requestInfo = useOptionalRequestInfo()
	if (!requestInfo) {
		throw new Error('No requestInfo found in root loader')
	}

	return requestInfo
}

export const useHints = () => {
	const requestInfo = useRequestInfo()
	return requestInfo.hints
}

export function useOptionalRequestInfo() {
	const data = useRouteLoaderData<typeof rootLoader>('root')
	return data?.requestInfo
}

export const useOptionalHints = () => {
	const requestInfo = useOptionalRequestInfo()
	return requestInfo?.hints
}
