import { db } from '#app/utils/db.server.ts'
import { getFromStorage } from '#app/utils/storage/storage.server.ts'
import { ServerTiming } from '#app/utils/timings.server.ts'
import { type Route } from './+types/user-images.$imageId'

export const getUserImgSrc = (imageId: string) =>
	`/resources/user-images/${imageId}`

export async function loader({ params: { imageId } }: Route.LoaderArgs) {
	if (!imageId) {
		throw new Response('Image ID is required', { status: 400 })
	}

	const timing = new ServerTiming()

	timing.time('find user image meta', 'Find user image meta in database')
	const image = await db.query.userImageTable.findFirst({
		columns: { object_key: true },
		where: (userImageTable, { eq }) => eq(userImageTable.id, imageId),
	})
	timing.timeEnd('find user image meta')

	if (!image) {
		throw new Response('Not found', {
			status: 404,
			headers: {
				'Server-Timing': timing.toString(),
			},
		})
	}

	timing.time('retrieve user image', 'Retrieve user image from bucket')
	const response = await getFromStorage(image.object_key)
	timing.timeEnd('retrieve user image')

	return new Response(response.body, {
		headers: {
			'Content-Type': response.type,
			'Cache-Control': 'public, max-age=31536000, immutable',
			'Server-Timing': timing.toString(),
		},
	})
}
