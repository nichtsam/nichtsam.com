import { createHash, createHmac } from 'node:crypto'
import path from 'node:path'
import { nanoid as createId } from 'nanoid'
import { env } from './env.server'

const STORAGE_REGION = env.AWS_REGION
const STORAGE_BUCKET = env.BUCKET_NAME
const STORAGE_ENDPOINT = virtualHostedUri(
	env.AWS_ENDPOINT_URL_S3,
	STORAGE_BUCKET,
)
const STORAGE_ACCESS_KEY = env.AWS_ACCESS_KEY_ID
const STORAGE_SECRET_KEY = env.AWS_SECRET_ACCESS_KEY

function virtualHostedUri(uri: string, bucket: string) {
	return uri.replace('://', `://${bucket}.`)
}

export async function deleteFromStorage(key: string) {
	const { url, headers } = getSignedDeleteRequestInfo(key)

	return fetch(url, {
		method: 'DELETE',
		headers,
	})
}

export async function getFromStorage(key: string) {
	const { url, headers } = getSignedGetRequestInfo(key)

	return fetch(url, {
		method: 'GET',
		headers,
	})
}

export async function uploadToStorage(file: File, key: string) {
	const { url, headers } = getSignedPutRequestInfo(file, key)

	return fetch(url, {
		method: 'PUT',
		headers,
		body: file,
	})
}

export async function uploadUserImage(userId: string, image: File) {
	const fileId = createId()
	const fileExtension = path.extname(image.name)
	const timestamp = Date.now()
	const key = `users/${userId}/user-images/${timestamp}-${fileId}${fileExtension}`

	const response = await uploadToStorage(image, key)

	if (!response.ok) {
		console.error(await response.text())
		console.error(
			`Failed to upload file to storage. Server responded with ${response.status}: ${response.statusText}`,
		)
		throw new Error(`Failed to upload object: ${key}`)
	}

	return key
}

function getBaseSignedRequestInfo({
	method,
	key,
	contentType,
}: {
	method: 'GET' | 'PUT' | 'DELETE'
	key: string
	contentType?: string
}) {
	const url = new URL(key, STORAGE_ENDPOINT)

	const timestamp =
		new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z'
	const datestamp = timestamp.slice(0, 8)

	const headers: Record<string, string> = {
		host: url.host,
		'x-amz-date': timestamp,
		'x-amz-content-sha256': 'UNSIGNED-PAYLOAD',

		...(contentType ? { 'content-type': contentType } : {}),
	}

	const canonicalQueryString = ''
	const { canonicalHeaders, signedHeaders } = getCanonicalHeaders(headers)
	const canonicalRequest = [
		method,
		url.pathname,
		canonicalQueryString,
		canonicalHeaders,
		signedHeaders,
		'UNSIGNED-PAYLOAD',
	].join('\n')

	const algorithm = 'AWS4-HMAC-SHA256'
	const scope = `${datestamp}/${STORAGE_REGION}/s3/aws4_request`
	const stringToSign = [
		algorithm,
		timestamp,
		scope,
		hexsha256(canonicalRequest),
	].join('\n')

	const signature = getSignature(
		STORAGE_SECRET_KEY,
		datestamp,
		STORAGE_REGION,
		's3',
		stringToSign,
	)

	const authorization = [
		`${algorithm} Credential=${STORAGE_ACCESS_KEY}/${scope}`,
		`SignedHeaders=${signedHeaders}`,
		`Signature=${signature}`,
	].join(',')

	headers['Authorization'] = authorization

	return { url, headers }
}

function hexsha256(string: string) {
	return createHash('sha256').update(string).digest('hex')
}

function hmacSha256(key: string | Buffer, string: string) {
	return createHmac('sha256', key).update(string).digest()
}

function hexhmac(key: string | Buffer, string: string) {
	return createHmac('sha256', key).update(string).digest('hex')
}

function getSignature(
	secretAccessKey: string,
	datestamp: string,
	regionName: string,
	serviceName: string,
	stringToSign: string,
) {
	const kDate = hmacSha256('AWS4' + secretAccessKey, datestamp)
	const kRegion = hmacSha256(kDate, regionName)
	const kService = hmacSha256(kRegion, serviceName)
	const kSigning = hmacSha256(kService, 'aws4_request')
	return hexhmac(kSigning, stringToSign)
}

function getCanonicalHeaders(headers: Record<string, string>) {
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

function getSignedPutRequestInfo(file: File, key: string) {
	return getBaseSignedRequestInfo({
		method: 'PUT',
		key,
		contentType: file.type,
	})
}

function getSignedDeleteRequestInfo(key: string) {
	return getBaseSignedRequestInfo({
		method: 'DELETE',
		key,
	})
}

function getSignedGetRequestInfo(key: string) {
	return getBaseSignedRequestInfo({
		method: 'GET',
		key,
	})
}
