import path from 'node:path'
import { nanoid as createId } from 'nanoid'
import { getSignedUrl } from './presigned.server.ts'

export async function checkInStorage(key: string) {
	const url = getSignedUrl({ method: 'HEAD', key })

	return fetch(url, {
		method: 'HEAD',
	})
}

export async function getFromStorage(key: string) {
	const url = getSignedUrl({ method: 'GET', key })

	return fetch(url, {
		method: 'GET',
	})
}

export async function deleteFromStorage(key: string) {
	const url = getSignedUrl({ method: 'DELETE', key })

	return fetch(url, {
		method: 'DELETE',
	})
}

export async function uploadToStorage(file: File, key: string) {
	const url = getSignedUrl({
		method: 'PUT',
		key,
		contentType: file.type,
	})

	return fetch(url, {
		method: 'PUT',
		headers: {
			'content-type': file.type,
		},
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
