import { getFormProps, useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { useFetcher, useFetchers } from '@remix-run/react'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import { Button } from '#app/components/ui/button.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import { unvariant } from './misc.ts'
import { useRequestInfo, useHints } from './request-info.ts'
import { type setTheme as setThemeAction } from './theme.server.ts'

export const SET_THEME_INTENT = 'set-theme'

export const ThemeFormSchema = z.object({
	theme: z.enum(['system', 'light', 'dark']),
})

export const useTheme = () => {
	const requestInfo = useRequestInfo()
	const hints = useHints()

	const optimisticMode = useOptimisticThemeMode()
	if (optimisticMode) {
		return optimisticMode === 'system' ? hints.theme : optimisticMode
	}

	return requestInfo.userPreferences.theme ?? hints.theme
}

export function useOptimisticThemeMode() {
	const fetchers = useFetchers()
	const themeFetcher = fetchers.find((f) => f.formAction === '/')

	if (themeFetcher && themeFetcher.formData) {
		const submission = parseWithZod(themeFetcher.formData, {
			schema: ThemeFormSchema,
		})

		if (submission.status === 'success') {
			return submission.value.theme
		}
	}
}

export const ThemeSwitcher = () => {
	const [clientJavascriptEnable, setClientJavascriptEnable] = useState(false)

	const {
		userPreferences: { theme: themPreference },
	} = useRequestInfo()
	const fetcher = useFetcher<typeof setThemeAction>()

	const [form] = useForm({
		id: 'theme-switch',
		lastResult: fetcher.data?.result,
	})

	const optimisticMode = useOptimisticThemeMode()
	const mode = optimisticMode ?? themPreference ?? 'system'
	const nextMode =
		mode === 'system' ? 'light' : mode === 'light' ? 'dark' : 'system'
	const modeLabel = {
		light: <Icon name="sun" className="animate-in fade-in" />,
		dark: <Icon name="moon" className="animate-in fade-in" />,
		system: <Icon name="laptop" className="animate-in fade-in" />,
	}

	useEffect(() => {
		setClientJavascriptEnable(true)
	}, [])

	return (
		<fetcher.Form method="POST" action="/" {...getFormProps(form)}>
			<input type="hidden" name="theme" value={nextMode} />

			<Button
				name="intent"
				value={SET_THEME_INTENT}
				type="submit"
				size="icon"
				variant="ghost"
				aria-label="Dark Mode Toggler"
				disabled={!clientJavascriptEnable}
				className={unvariant(
					!clientJavascriptEnable,
					'disabled:pointer-events-auto',
				)}
				title={unvariant(
					!clientJavascriptEnable,
					'Theme switching is disabled due to lack of JavaScript support. Please enable JavaScript or use a browser that supports it to enable this feature.',
				)}
			>
				{modeLabel[nextMode]}
			</Button>
		</fetcher.Form>
	)
}
