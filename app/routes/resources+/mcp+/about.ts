import { data } from 'react-router'
import { profile } from '#app/config/profile.ts'

export async function loader() {
	return data(profile, {
		headers: {
			'Cache-Control': 'max-age=86400',
		},
	})
}
