import { getImgResponse, type ImgSource } from 'openimg/node'
import { redirect } from 'react-router'
import { env } from '#app/utils/env.server.ts'
import { responseToFile } from '#app/utils/misc.ts'
import { getSignedUrl } from '#app/utils/storage/presigned.server.ts'
import {
	checkInStorage,
	uploadToStorage,
} from '#app/utils/storage/storage.server.ts'
import { ServerTiming } from '#app/utils/timings.server.ts'
import { type Route } from './+types/images.ts'

const STORAGE_BUCKET = env.BUCKET_NAME
const STORAGE_ENDPOINT = env.AWS_ENDPOINT_URL_S3.replace(
	'://',
	`://${STORAGE_BUCKET}.`,
)

type ImgSrcType = 'external' | 'object' | 'public'
export function getImgSrc(type: ImgSrcType, path: string) {
	return `${type}:${path}`
}

export async function loader({ request }: Route.LoaderArgs) {
	const url = new URL(request.url)
	const searchParams = url.searchParams
	const src = searchParams.get('src')
	if (!src) {
		throw new Response('src query parameter is required', { status: 400 })
	}

	const [type, path] = src.split(':')

	if (!type) {
		throw new Response('malformed src query parameter, missing type', {
			status: 400,
		})
	}

	if (!path) {
		throw new Response('malformed src query parameter, missing path', {
			status: 400,
		})
	}

	const headers = new Headers({
		'Cache-Control': 'public, max-age=31536000, immutable',
	})

	const timing = new ServerTiming()

	const cacheKey = `__opening_cache/${type}/${path}`

	timing.time('check cache in bucket', 'Check if optimized image has cache')
	const response = await checkInStorage(cacheKey)
	timing.timeEnd('check cache in bucket')

	if (response.ok) {
		timing.time('get presigned url')
		const presignedUrl = getSignedUrl({ method: 'GET', key: cacheKey })
		timing.timeEnd('get presigned url')

		headers.append('Server-Timing', timing.toString())
		return redirect(presignedUrl.toString(), {
			headers,
		})
	}

	let imgSource: ImgSource
	timing.time('branching img source')
	switch (type) {
		case 'external': {
			if (!URL.canParse(path)) {
				throw new Response(
					'malformed src query parameter, invalid external url',
					{ status: 400 },
				)
			}

			imgSource = {
				type: 'fetch',
				url: path,
			}
			break
		}
		case 'public': {
			imgSource = {
				type: 'fs',
				path,
			}
			break
		}
		case 'object': {
			timing.time('get presigned url')
			const url = getSignedUrl({ method: 'GET', key: path })
			timing.timeEnd('get presigned url')

			imgSource = {
				type: 'fetch',
				url: url.toString(),
			}
			break
		}
		default:
			throw new Response('malformed src query parameter, invalid type', {
				status: 400,
			})
	}
	timing.timeEnd('branching img source')

	headers.append('Server-Timing', timing.toString())
	const imgResonse = await getImgResponse(request, {
		allowlistedOrigins: [STORAGE_ENDPOINT],
		cacheFolder: 'no_cache',
		headers,
		getImgSource: async () => imgSource,
	})

	if (imgResonse.ok) {
		void uploadToStorage(await responseToFile(imgResonse.clone()), cacheKey)
	}

	return imgResonse
}
