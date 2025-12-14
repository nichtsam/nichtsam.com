import { getFormProps, useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod/v4'
import { useFetcher, useFetchers } from 'react-router'
import { z } from 'zod'
import { Button } from '#app/components/ui/button.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import {
	useRequestInfo,
	useHints,
	useOptionalRequestInfo,
	useOptionalHints,
} from './request-info.ts'
import { type setTheme as setThemeAction } from './theme.server.ts'
import { cn } from './ui.ts'

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

export const useOptionalTheme = () => {
	const requestInfo = useOptionalRequestInfo()
	const hints = useOptionalHints()
	const optimisticMode = useOptimisticThemeMode()
	if (optimisticMode) {
		return optimisticMode === 'system' ? hints?.theme : optimisticMode
	}

	return requestInfo?.userPreferences.theme ?? hints?.theme
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

const modeLabel = {
	light: <Icon name="sun" className="animate-in fade-in" />,
	dark: <Icon name="moon" className="animate-in fade-in" />,
	system: <Icon name="laptop" className="animate-in fade-in" />,
}

export const ThemeSwitcher = () => {
	const fetcher = useFetcher<typeof setThemeAction>()
	const [form] = useForm({
		id: 'theme-switch',
		lastResult: fetcher.data?.result,
	})

	const themePreference = useOptionalRequestInfo()?.userPreferences.theme
	const optimisticMode = useOptimisticThemeMode()
	const mode = optimisticMode ?? themePreference ?? 'system'
	const nextMode =
		mode === 'system' ? 'light' : mode === 'light' ? 'dark' : 'system'

	return (
		<fetcher.Form method="POST" action="/" {...getFormProps(form)}>
			<input type="hidden" name="theme" value={nextMode} />

			<noscript>
				<Button
					type="button"
					size="icon"
					variant="ghost"
					aria-label="Dark Mode Toggler"
					className={cn('hint-js-required')}
					title={
						'Theme switching is disabled due to lack of JavaScript support. Please enable JavaScript or use a browser that supports it to enable this feature.'
					}
				>
					{modeLabel[nextMode]}
				</Button>
			</noscript>

			<Button
				name="intent"
				value={SET_THEME_INTENT}
				type="submit"
				size="icon"
				variant="ghost"
				aria-label="Dark Mode Toggler"
				className="js-required"
			>
				{modeLabel[nextMode]}
			</Button>
		</fetcher.Form>
	)
}
