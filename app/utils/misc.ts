import { useEffect, useState } from 'react'

export function sleep(ms: number) {
	return new Promise<void>((res) => setTimeout(() => res(), ms))
}

export function generateCallAll<Args extends Array<unknown>>(
	...fns: Array<((...arg: Args) => unknown) | null | undefined>
) {
	return (...arg: Args) => fns.forEach((fn) => fn?.(...arg))
}

export async function downloadFile(
	url: string,
	retries: number = 0,
	max_retries: number = 3,
) {
	try {
		const response = await fetch(url)

		if (!response.ok) {
			throw new Error(`Failed to fetch image with status ${response.status}`)
		}

		// contentType fallback : https://www.rfc-editor.org/rfc/rfc9110.html#section-8.3-5
		const contentType =
			response.headers.get('content-type') ?? 'application/octet-stream'
		const blob = Buffer.from(await response.arrayBuffer())

		return { contentType, blob }
	} catch (e) {
		if (retries > max_retries) throw e
		return downloadFile(url, retries + 1, max_retries)
	}
}

export function useClientJavascriptEnable() {
	const [clientJavascriptEnable, setClientJavascriptEnable] = useState(false)

	useEffect(() => {
		setClientJavascriptEnable(true)
	}, [])

	return clientJavascriptEnable
}

export type Prettify<T> = {
	[K in keyof T]: T[K]
} & {}
