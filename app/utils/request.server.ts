const getFormData = async (request: Request) => {
	try {
		return await request.clone().formData()
	} catch (err: unknown) {
		console.error(err)
		throw new Response('Invalid form', { status: 400 })
	}
}

const mergeHeaders = (
	main: Headers,
	...headers: Array<ResponseInit['headers'] | null | undefined>
) => {
	for (const header of headers) {
		if (!header) continue
		for (const [key, value] of new Headers(header).entries()) {
			main.append(key, value)
		}
	}
}

const combineHeaders = (
	...headers: Array<ResponseInit['headers'] | null | undefined>
) => {
	const combined = new Headers()
	mergeHeaders(combined, ...headers)
	return combined
}

export { getFormData, mergeHeaders, combineHeaders }
