import mime from 'mime'
import { useEffect, useState } from 'react'

export function sleep(ms: number) {
	return new Promise<void>((res) => setTimeout(() => res(), ms))
}

export function removeTrailingSlash(s: string) {
	return s.endsWith('/') ? s.slice(0, -1) : s
}

export function getOrigin(request: Request) {
	const host =
		request.headers.get('X-Forwarded-Host') ??
		request.headers.get('host') ??
		new URL(request.url).host
	const protocol = request.headers.get('X-Forwarded-Proto') ?? 'http'
	return `${protocol}://${host}`
}

export function generateCallAll<Args extends Array<unknown>>(
	...fns: Array<((...arg: Args) => unknown) | null | undefined>
) {
	return (...arg: Args) => fns.forEach((fn) => fn?.(...arg))
}

export async function responseToFile(response: Response) {
	// contentType fallback : https://www.rfc-editor.org/rfc/rfc9110.html#section-8.3-5
	const contentType =
		response.headers.get('content-type') ?? 'application/octet-stream'

	const extension = mime.getExtension(contentType)
	const filename = extension
		? `downloaded-file.${extension}`
		: `downloaded-file`

	const file = new File([await response.arrayBuffer()], filename, {
		type: contentType,
	})
	return file
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

		return await responseToFile(response)
	} catch (e) {
		if (retries > max_retries) throw e
		return downloadFile(url, retries + 1, max_retries)
	}
}

export function useClientJavascriptEnabled() {
	const [clientJavascriptEnabled, setClientJavascriptEnabled] = useState(false)

	useEffect(() => {
		setClientJavascriptEnabled(true)
	}, [])

	return clientJavascriptEnabled
}

export type SmartString = string & Record<never, never>
export type Prettify<T> = {
	[K in keyof T]: T[K]
} & {}
