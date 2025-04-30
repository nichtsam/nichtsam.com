import * as ProgressPrimitive from '@radix-ui/react-progress'
import { useEffect, useRef, useState } from 'react'
import { useNavigation } from 'react-router'
import { useSpinDelay } from 'spin-delay'
import { cn } from '#app/utils/ui.ts'
import { Icon } from './ui/icon.tsx'

function NavProgress() {
	const navigation = useNavigation()
	const busy = useSpinDelay(navigation.state !== 'idle', {
		delay: 400,
		minDuration: 1000,
	})

	const [animationComplete, setAnimationComplete] = useState(true)
	const indicatorRef = useRef<HTMLDivElement>(null)

	let progressRate = 0
	if (busy && !animationComplete) progressRate = 100
	if (busy && navigation.state === 'submitting') progressRate = 35
	if (busy && navigation.state === 'loading') progressRate = 70

	useEffect(() => {
		if (!indicatorRef.current) return
		if (busy) {
			setAnimationComplete(false)
			return
		} else {
			const animationPromises = indicatorRef.current
				.getAnimations()
				.map(({ finished }) => finished)

			void Promise.allSettled(animationPromises).then(() => {
				setAnimationComplete(true)
			})
		}
	}, [busy])

	return (
		<ProgressPrimitive.Root
			aria-label="Page Navigation Progress"
			aria-hidden={busy ? undefined : true}
			aria-valuetext={busy ? 'Loading' : 'Idle'}
			className={cn(
				'pointer-events-none fixed inset-x-0 top-0 z-60 flex flex-col items-end transition-all duration-500',
				!busy && 'opacity-0',
			)}
		>
			<div className={cn('bg-primary/20 relative h-1 w-full overflow-hidden')}>
				<ProgressPrimitive.Indicator
					ref={indicatorRef}
					className="bg-primary size-full flex-1 transition-all duration-500"
					style={{ transform: `translateX(-${100 - progressRate}%)` }}
				/>
			</div>

			<Icon
				name="loader-circle"
				className={cn('m-1', { 'animate-spin': !animationComplete })}
				aria-hidden
			/>
		</ProgressPrimitive.Root>
	)
}

export { NavProgress }
