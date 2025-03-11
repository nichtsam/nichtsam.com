import { Cloudinary as _Cloudinary } from '@cloudinary/url-gen'

export const cloudinary = new _Cloudinary({
	cloud: {
		cloudName: 'nichtsam',
	},
	url: {
		secure: true,
	},
})
