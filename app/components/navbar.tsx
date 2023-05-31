import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import * as Avatar from "@radix-ui/react-avatar";
import * as Dialog from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { Cross2Icon, HamburgerMenuIcon } from "@radix-ui/react-icons";
import { NavLink } from "./link";
import { ThemeSwitcher } from "./theme-switcher";

const LINKS = [
  {
    name: "Home",
    to: "/",
  },
  {
    name: "About",
    to: "/about",
  },
  {
    name: "Blog",
    to: "/blog",
  },
];

export const NavBar = () => {
  return (
    <div className="container mx-auto flex items-center p-9 md:gap-16">
      <span className="text-highlight text-3xl font-bold">nichtsam</span>

      <NavigationMenu.Root className="flex-1">
        <NavigationMenu.List className="flex items-center gap-8 text-lg font-bold">
          {/* hidden when below medium breakpoint */}
          <BasicLinks />

          <NavigationMenu.Item className="ml-auto self-stretch opacity-0 md:opacity-100"></NavigationMenu.Item>

          {/* replace `BasicLinks` when below medium breakpoint */}
          <NavigationMenu.Item className="md:hidden">
            <BasicLinksHamburger />
          </NavigationMenu.Item>

          <NavigationMenu.Item className="hidden md:list-item">
            <ThemeSwitcher />
          </NavigationMenu.Item>

          <NavigationMenu.Item>
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

const BasicLinksHamburger = () => (
  <Dialog.Root>
    <Dialog.Trigger aria-label="Navigation menu">
      <HamburgerMenuIcon />
    </Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Content className="bg-primary absolute inset-0 z-50">
        <VisuallyHidden.Root>
          <Dialog.Title>Navigation Menu</Dialog.Title>
          <Dialog.Description>Here is the navigation menu.</Dialog.Description>
        </VisuallyHidden.Root>

        <Dialog.Close className="absolute right-5 top-5 z-50">
          <Cross2Icon className="h-5 w-5" />
        </Dialog.Close>

        <div className="p-9">
          <NavigationMenu.Root>
            <NavigationMenu.List className="text-3xl font-bold">
              <NavigationMenu.Item className="mb-4">
                <ThemeSwitcher />
              </NavigationMenu.Item>

              {LINKS.map((link) => (
                <NavigationMenu.Item key={link.to}>
                  <NavLink prefetch="intent" to={link.to}>
                    {link.name}
                  </NavLink>
                </NavigationMenu.Item>
              ))}
            </NavigationMenu.List>
          </NavigationMenu.Root>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);

const UserAccount = () => (
  <Avatar.Root className="inline-flex h-10 w-10 select-none items-center justify-center overflow-hidden rounded-full align-middle">
    <Avatar.Fallback className="bg-inverse text-inverse flex h-full w-full items-center justify-center text-sm font-bold leading-none">
      SJ
    </Avatar.Fallback>
  </Avatar.Root>
);
