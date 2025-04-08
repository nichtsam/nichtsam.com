import { type SmartString } from '../misc'

export function getCanonicalQueryString(searchParams: URLSearchParams) {
	return Array.from(searchParams.entries())
		.sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
		.map(
			([param, value]) =>
				`${encodeURIComponent(param)}=${encodeURIComponent(value)}`,
		)
		.join('&')
}

export function getCanonicalHeaders(headers: Record<string, string>) {
	let canonicalHeaders = []
	let signedHeaders = []

	const sortedHeaderEntries = Object.entries(headers).sort(([keyA], [keyB]) =>
		keyA.localeCompare(keyB),
	)

	for (let header of sortedHeaderEntries) {
		canonicalHeaders.push(`${header[0]}:${header[1].trim()}`)
		signedHeaders.push(header[0])
	}

	return {
		canonicalHeaders: canonicalHeaders.join('\n') + '\n',
		signedHeaders: signedHeaders.join(';'),
	}
}

export function getCanonicalRequest({
	method,
	canonicalUri,
	canonicalQueryString,
	canonicalHeaders,
	signedHeaders,
	hashedPayload,
}: {
	method: 'GET' | 'PUT' | 'DELETE'
	canonicalUri: string
	canonicalQueryString: string
	canonicalHeaders: string
	signedHeaders: string
	hashedPayload:
		| SmartString
		| 'UNSIGNED-PAYLOAD'
		| 'STREAMING-AWS4-HMAC-SHA256-PAYLOAD'
}) {
	return [
		method,
		canonicalUri,
		canonicalQueryString,
		canonicalHeaders,
		signedHeaders,
		hashedPayload,
	].join('\n')
}
