import { MobileNavigation } from "./mobile.tsx";
import { CORE_CONTENT_LINKS } from "./constant.ts";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "../ui/navigation-menu.tsx";
import { NavLink } from "../link.tsx";
import { UserButton } from "../user.tsx";
import { ThemeSwitcher } from "#app/utils/theme.tsx";

export const NavBar = () => {
  return (
    <div className="flex items-center p-9 md:gap-16">
      <span className="text-xl font-bold sm:text-3xl">nichtsam</span>

      <NavigationMenu className="max-w-none">
        <CoreContentNav />

        {/* Spacing adjustment */}
        <div className="flex-grow" />

        <NonTextNav />
      </NavigationMenu>
    </div>
  );
};

const CoreContentNav = () => (
  <NavigationMenuList className="hidden md:flex">
    {CORE_CONTENT_LINKS.map(({ to, name }) => (
      <LinkItem key={to} to={to} name={name} />
    ))}
  </NavigationMenuList>
);

const LinkItem = ({ to, name }: { to: string; name: string }) => (
  <NavigationMenuItem>
    <NavigationMenuLink asChild>
      <NavLink
        prefetch="intent"
        to={to}
        className={navigationMenuTriggerStyle()}
      >
        {name}
      </NavLink>
    </NavigationMenuLink>
  </NavigationMenuItem>
);

const NonTextNav = () => (
  <NavigationMenuList>
    <NavigationMenuItem className="md:hidden">
      <MobileNavigation />
    </NavigationMenuItem>

    <NavigationMenuItem>
      <ThemeSwitcher />
    </NavigationMenuItem>

    <NavigationMenuItem className="hidden md:ml-2 md:list-item">
      <UserButton />
    </NavigationMenuItem>
  </NavigationMenuList>
);
