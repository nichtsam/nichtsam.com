const getFormData = async (request: Request) => {
	try {
		return await request.clone().formData()
	} catch (err: unknown) {
		console.error(err)
		throw new Response('Invalid form', { status: 400 })
	}
}

export { getFormData }
