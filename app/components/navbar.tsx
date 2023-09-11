import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import * as Dialog from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { Cross2Icon, HamburgerMenuIcon } from "@radix-ui/react-icons";
import { NavLink } from "@/components/link.tsx";
import { ThemeSwitcher } from "./theme-switcher.tsx";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar.tsx";

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
    <div className="container flex items-center p-9  md:gap-16">
      <span className="text-3xl font-bold">nichtsam</span>

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

const BasicLinksHamburger = () => {
  const [open, setOpen] = useState(false);
  const closeDialog = () => {
    setOpen(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger aria-label="Navigation menu">
        <HamburgerMenuIcon />
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="bg-gray-9 fixed inset-0 overflow-auto">
          <Dialog.Content className="flex h-full flex-col gap-4 overflow-hidden p-9">
            <VisuallyHidden.Root>
              <Dialog.Title>Navigation Menu</Dialog.Title>
              <Dialog.Description>
                Here is the navigation menu.
              </Dialog.Description>
            </VisuallyHidden.Root>

            <div className="flex justify-between">
              <ThemeSwitcher />

              <Dialog.Close>
                <Cross2Icon className="h-5 w-5" />
              </Dialog.Close>
            </div>

            <NavigationMenu.Root className="border-t-gray-6 overflow-y-scroll border-t-2 text-3xl font-bold">
              <NavigationMenu.List>
                {LINKS.map((link) => (
                  <NavigationMenu.Item key={link.to} onClick={closeDialog}>
                    <NavLink to={link.to}>{link.name}</NavLink>
                  </NavigationMenu.Item>
                ))}
              </NavigationMenu.List>
            </NavigationMenu.Root>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

const UserAccount = () => (
  <Avatar>
      <AvatarImage src="https://avatars.githubusercontent.com/u/44519206?v=4" alt="@nichtsam" />
      <AvatarFallback>SJ</AvatarFallback>
    </Avatar>
);
