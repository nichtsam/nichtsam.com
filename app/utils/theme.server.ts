import { parseWithZod } from '@conform-to/zod/v4'
import { parse as parseCookie, serialize as serializeCookie } from 'cookie'
import { data } from 'react-router'
import { ThemeFormSchema } from './theme.tsx'

const cookieName = 'theme'
export type Theme = 'light' | 'dark'

export const getTheme = (request: Request): Theme | null => {
	const cookieHeader = request.headers.get('Cookie')
	const parsed = cookieHeader ? parseCookie(cookieHeader)[cookieName] : 'light'

	if (parsed === 'light' || parsed === 'dark') return parsed

	return null
}

const setThemeCookie = (theme: Theme | 'system'): string => {
	if (theme === 'system') {
		return serializeCookie(cookieName, '', { path: '/', maxAge: -1 })
	} else {
		return serializeCookie(cookieName, theme, { path: '/' })
	}
}

export const setTheme = async (formData: FormData) => {
	const submission = parseWithZod(formData, {
		schema: ThemeFormSchema,
	})

	if (submission.status !== 'success') {
		return data(
			{ result: submission.reply() },
			{ status: submission.status === 'error' ? 400 : 200 },
		)
	}

	const { theme } = submission.value

	const responseInit = {
		headers: { 'set-cookie': setThemeCookie(theme) },
	}
	return data({ result: submission.reply() }, responseInit)
}
