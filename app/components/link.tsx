import { NavLink as RemixNavLink } from "@remix-run/react";
import type { NavLinkProps as RemixNavLinkProps } from "@remix-run/react";
import clsx from "clsx";

export interface NavLinkProps extends RemixNavLinkProps {}

export const NavLink = ({ className, ...props }: NavLinkProps) => (
  <RemixNavLink
    {...props}
    className={({ isActive }) =>
      clsx(className, "transition-colors", {
        "text-primary underline": isActive,
        "text-secondary hover:text-current hover:underline": !isActive,
      })
    }
  />
);

// TODO
export const ExternalLink = () => {};

// TODO
export const DownloadLink = () => {};
