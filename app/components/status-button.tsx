import { forwardRef } from 'react'
import { cn } from '#app/utils/ui.ts'
import { type ButtonProps, Button } from './ui/button.tsx'
import { Icon } from './ui/icon.tsx'

export interface StatusButtonProps extends ButtonProps {
	status: 'success' | 'pending' | 'error' | 'idle'
}
export const StatusButton = forwardRef<HTMLButtonElement, StatusButtonProps>(
	({ status, className, children, ...props }, ref) => {
		const statusIcon = {
			success: <Icon name="check-circled" className="text-green-600" />,
			pending: <Icon name="update" className="animate-spin" />,
			error: (
				<Icon
					name="cross-circled"
					className="rounded-full bg-destructive text-destructive-foreground"
				/>
			),
			idle: null,
		}[status]

		return (
			<Button
				disabled={status === 'pending'}
				ref={ref}
				className={cn('flex justify-center gap-x-4', className)}
				{...props}
			>
				{children}
				{statusIcon}
			</Button>
		)
	},
)

StatusButton.displayName = 'StatusButton'
