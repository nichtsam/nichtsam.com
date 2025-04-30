import { type ReactNode, type SVGProps } from 'react'
import { cn } from '#app/utils/ui.ts'
import href from './icons/sprite.svg?url'
import { type IconName } from '@/icon-name'

const sizeClassName = {
	font: 'size-[1em]',
	xs: 'size-2',
	sm: 'size-3',
	base: 'size-4',
	lg: 'size-5',
	xl: 'size-6',
} as const

type Size = keyof typeof sizeClassName

const spanGapClassName = {
	font: 'gap-x-2',
	xs: 'gap-x-1.5',
	sm: 'gap-x-1.5',
	base: 'gap-x-2',
	lg: 'gap-x-2',
	xl: 'gap-x-3',
} satisfies Record<Size, string>

interface IconProp extends Omit<SVGProps<SVGSVGElement>, 'children'> {
	name: IconName
	size?: Size
}
function Icon({ name, size = 'font', className, ...props }: IconProp) {
	return (
		<svg className={cn(sizeClassName[size], className)} {...props}>
			<use href={`${href}#${name}`} />
		</svg>
	)
}

interface RefinedIconProps extends IconProp {
	children?: ReactNode
}
function RefinedIcon({
	name,
	size = 'font',
	children,
	...rest
}: RefinedIconProps) {
	if (!children) {
		return <Icon name={name} size={size} {...rest} />
	}

	return (
		<span className={cn('inline-flex items-center', spanGapClassName[size])}>
			<Icon name={name} size={size} {...rest} />
			{children}
		</span>
	)
}

export { RefinedIcon as Icon }
