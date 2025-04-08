import { env } from '../env.server.ts'
import {
	getCanonicalHeaders,
	getCanonicalQueryString,
	getCanonicalRequest,
} from './canonical.server.ts'
import { getSignature, getStringtoSign } from './sigv4.server.ts'

const STORAGE_REGION = env.AWS_REGION
const STORAGE_BUCKET = env.BUCKET_NAME
const STORAGE_ENDPOINT = env.AWS_ENDPOINT_URL_S3.replace(
	'://',
	`://${STORAGE_BUCKET}.`,
)
const STORAGE_ACCESS_KEY = env.AWS_ACCESS_KEY_ID
const STORAGE_SECRET_KEY = env.AWS_SECRET_ACCESS_KEY

export async function getSignedUrl({
	method,
	key,
	contentType,
	expires,
}: {
	method: 'GET' | 'DELETE' | 'PUT'
	key: string
	contentType?: string
	expires: number
}) {
	const url = new URL(key, STORAGE_ENDPOINT)
	const algorithm = 'AWS4-HMAC-SHA256'
	const timestamp =
		new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z'
	const datestamp = timestamp.slice(0, 8)
	const scope = `${datestamp}/${STORAGE_REGION}/s3/aws4_request`
	const credential = `${STORAGE_ACCESS_KEY}/${scope}`

	url.searchParams.set('X-Amz-Algorithm', algorithm)
	url.searchParams.set('X-Amz-Credential', credential)
	url.searchParams.set('X-Amz-Date', timestamp)
	url.searchParams.set('X-Amz-Expires', expires.toString())

	const { canonicalHeaders, signedHeaders } = getCanonicalHeaders({
		host: url.host,

		...(contentType ? { 'content-type': contentType } : {}),
	})

	url.searchParams.set('X-Amz-SignedHeaders', signedHeaders)

	const canonicalQueryString = getCanonicalQueryString(url.searchParams)
	const canonicalRequest = getCanonicalRequest({
		method,
		canonicalUri: url.pathname,
		canonicalQueryString,
		canonicalHeaders,
		signedHeaders,
		hashedPayload: 'UNSIGNED-PAYLOAD',
	})

	const stringToSign = getStringtoSign({
		algorithm,
		timestamp,
		scope,
		canonicalRequest,
	})

	const signature = getSignature({
		secretAccessKey: STORAGE_SECRET_KEY,
		datestamp,
		regionName: STORAGE_REGION,
		serviceName: 's3',
		stringToSign,
	})

	url.searchParams.append('X-Amz-Signature', signature)

	return url
}
