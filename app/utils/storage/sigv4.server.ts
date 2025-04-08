import { createHash, createHmac } from 'node:crypto'

function hexsha256(string: string) {
	return createHash('sha256').update(string).digest('hex')
}

function hmacSha256(key: string | Buffer, string: string) {
	return createHmac('sha256', key).update(string).digest()
}

function hexhmac(key: string | Buffer, string: string) {
	return createHmac('sha256', key).update(string).digest('hex')
}

type SigningKeyInfo = {
	secretAccessKey: string
	datestamp: string
	regionName: string
	serviceName: string
}

export function getSigningKey({
	secretAccessKey,
	datestamp,
	regionName,
	serviceName,
}: SigningKeyInfo) {
	const kDate = hmacSha256('AWS4' + secretAccessKey, datestamp)
	const kRegion = hmacSha256(kDate, regionName)
	const kService = hmacSha256(kRegion, serviceName)
	const kSigning = hmacSha256(kService, 'aws4_request')
	return kSigning
}

export function getStringtoSign({
	algorithm,
	timestamp,
	scope,
	canonicalRequest,
}: {
	algorithm: string
	timestamp: string
	scope: string
	canonicalRequest: string
}) {
	return [algorithm, timestamp, scope, hexsha256(canonicalRequest)].join('\n')
}

export function getSignature({
	secretAccessKey,
	datestamp,
	regionName,
	serviceName,
	stringToSign,
}: SigningKeyInfo & { stringToSign: string }) {
	const kSigning = getSigningKey({
		secretAccessKey,
		datestamp,
		regionName,
		serviceName,
	})
	return hexhmac(kSigning, stringToSign)
}
