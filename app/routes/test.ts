import { getSignedUrl } from '#app/utils/storage/presigned.server.ts'

export const loader = () => {
	return getSignedUrl({
		method: 'GET',
		key: 'users/qaadPfiErh_1AYPMuLwtU/user-images/1743982458561-_guLC5MP6VdiPNWdELUv-.png',
		expires: 30,
	})
}
