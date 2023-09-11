import { DialogTitle, DialogDescription } from "@radix-ui/react-dialog";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useState } from "react";
import { Button } from "../ui/button.tsx";
import { SheetTrigger, SheetContent, Sheet } from "../ui/sheet.tsx";
import { LINKS } from "./constant.ts";
import { NavLink } from "../link.tsx";
import { ScrollArea } from "../ui/scroll-area.tsx";

export const MobileNavigation = () => {
  const [open, setOpen] = useState(false);

  const onOpenChange = (open: boolean) => {
    setOpen(open);
  };

  const closeDialog = () => {
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button size="icon" variant="ghost" aria-label="Navigation Menu">
          <HamburgerMenuIcon />
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <VisuallyHidden>
          <DialogTitle>Navigation Menu</DialogTitle>
          <DialogDescription>
            Here goes the navigation and some other settings
          </DialogDescription>
        </VisuallyHidden>

        <ScrollArea className="h-full">
          <NavigationMenu.Root className="text-3xl font-bold">
            <NavigationMenu.List>
              {LINKS.map((link) => (
                <NavigationMenu.Item key={link.to}>
                  <NavLink onClick={closeDialog} to={link.to}>
                    {link.name}
                  </NavLink>
                </NavigationMenu.Item>
              ))}
            </NavigationMenu.List>
          </NavigationMenu.Root>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
