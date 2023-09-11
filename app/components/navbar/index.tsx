import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { NavLink } from "@/components/link.tsx";
import { ThemeSwitcher } from "../theme-switcher.tsx";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar.tsx";
import { MobileNavigation } from "./mobile.tsx";
import { LINKS } from "./constant.ts";

export const NavBar = () => {
  return (
    <div className="container flex items-center p-9  md:gap-16">
      <span className="text-xl font-bold sm:text-3xl">nichtsam</span>

      <NavigationMenu.Root className="flex-1">
        <NavigationMenu.List className="flex items-center gap-2 text-lg font-bold sm:gap-8">
          {/* hidden when below medium breakpoint */}
          <BasicLinks />

          <NavigationMenu.Item className="ml-auto self-stretch opacity-0 md:opacity-100"></NavigationMenu.Item>

          {/* replace `BasicLinks` when below medium breakpoint */}
          <NavigationMenu.Item className="md:hidden">
            <MobileNavigation />
          </NavigationMenu.Item>

          <NavigationMenu.Item>
            <ThemeSwitcher />
          </NavigationMenu.Item>

          <NavigationMenu.Item className="hidden sm:list-item">
            <UserAccount />
          </NavigationMenu.Item>
        </NavigationMenu.List>
      </NavigationMenu.Root>
    </div>
  );
};

const BasicLinks = () => (
  <>
    {LINKS.map((link) => (
      <NavigationMenu.Item className="hidden md:list-item" key={link.to}>
        <NavLink prefetch="intent" to={link.to}>
          {link.name}
        </NavLink>
      </NavigationMenu.Item>
    ))}
  </>
);

const UserAccount = () => (
  <Avatar>
    <AvatarImage
      src="https://avatars.githubusercontent.com/u/44519206?v=4"
      alt="@nichtsam"
    />
    <AvatarFallback>SJ</AvatarFallback>
  </Avatar>
);
