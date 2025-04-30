import { cn } from '#app/utils/ui.ts'
import { Button } from './ui/button.tsx'
import { Icon } from './ui/icon.tsx'

export interface StatusButtonProps extends Button.Props {
	status: 'success' | 'pending' | 'error' | 'idle'
}
export const StatusButton = ({
	status,
	className,
	children,
	...props
}: StatusButtonProps) => {
	const statusIcon = {
		success: <Icon name="check-circled" className="text-green-600" />,
		pending: <Icon name="update" className="animate-spin" />,
		error: (
			<Icon
				name="cross-circled"
				className="bg-destructive text-destructive-foreground rounded-full"
			/>
		),
		idle: null,
	}[status]

	return (
		<Button
			disabled={status === 'pending'}
			className={cn('flex justify-center gap-x-4', className)}
			{...props}
		>
			{children}
			{statusIcon}
		</Button>
	)
}

StatusButton.displayName = 'StatusButton'
