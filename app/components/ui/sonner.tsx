import { Toaster as Sonner, type ToasterProps } from 'sonner'
import { useOptimisticThemeMode } from '#app/utils/theme.tsx'

const Toaster = ({ ...props }: ToasterProps) => {
	const theme = useOptimisticThemeMode()

	return (
		<Sonner
			theme={theme}
			className="toaster group"
			style={
				{
					'--normal-bg': 'var(--popover)',
					'--normal-text': 'var(--popover-foreground)',
					'--normal-border': 'var(--border)',
				} as React.CSSProperties
			}
			{...props}
		/>
	)
}

export { Toaster }
