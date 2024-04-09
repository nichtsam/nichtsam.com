import type { ReactNode, SVGProps } from "react";
import { cn } from "#app/utils/ui";
import href from "./icons/sprite.svg";
import { type IconName } from "@/icon-name";

const sizeClassName = {
  font: "h-[1em] w-[1em]",
  xs: "h-2 w-2",
  sm: "h-3 w-3",
  base: "h-4 w-4",
  lg: "h-5 w-5",
  xl: "h-6 w-6",
} as const;

type Size = keyof typeof sizeClassName;

const spanGapClassName = {
  font: "gap-x-2",
  xs: "gap-x-1.5",
  sm: "gap-x-1.5",
  base: "gap-x-2",
  lg: "gap-x-2",
  xl: "gap-x-3",
} satisfies Record<Size, string>;

interface IconProp extends Omit<SVGProps<SVGSVGElement>, "children"> {
  name: IconName;
  size?: Size;
}
function Icon({ name, size = "font", className, ...props }: IconProp) {
  return (
    <svg className={cn(sizeClassName[size], className)} {...props}>
      <use href={`${href}#${name}`} />
    </svg>
  );
}

interface RefinedIconProps extends IconProp {
  children?: ReactNode;
}
function RefinedIcon({
  name,
  size = "font",
  children,
  ...rest
}: RefinedIconProps) {
  if (!children) {
    return <Icon name={name} size={size} {...rest} />;
  }

  return (
    <span className={cn("inline-flex items-center", spanGapClassName[size])}>
      <Icon name={name} size={size} {...rest} />
      {children}
    </span>
  );
}

export { RefinedIcon as Icon };
