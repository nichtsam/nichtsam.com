import { getImgResponse, type ImgSource } from 'openimg/node'
import { env } from '#app/utils/env.server.ts'
import { mergeHeaders } from '#app/utils/request.server.ts'
import { getSignedUrl } from '#app/utils/storage/presigned.server.ts'
import { ServerTiming, time } from '#app/utils/timings.server.ts'
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

	const timing = new ServerTiming()

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

			imgSource = { type: 'fetch', url: path }
			break
		}
		case 'public': {
			imgSource = { type: 'fs', path }
			break
		}
		case 'object': {
			const url = await time(timing, 'get presigned url', () =>
				getSignedUrl({ method: 'GET', key: path }),
			)

			imgSource = { type: 'fetch', url: url.toString() }
			break
		}
		default:
			throw new Response('malformed src query parameter, invalid type', {
				status: 400,
			})
	}
	timing.timeEnd('branching img source')

	timing.time('get img response', 'get optimized img')
	const imgResonse = await getImgResponse(request, {
		allowlistedOrigins: [STORAGE_ENDPOINT],
		cacheFolder: 'local/__openimg_cache/',
		getImgSource: async () => imgSource,
	})
	timing.timeEnd('get img response')

	mergeHeaders(imgResonse.headers, {
		'Cache-Control': 'public, max-age=31536000, immutable',
		'Server-Timing': timing.toString(),
	})
	return imgResonse
}
