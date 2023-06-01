import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { NavLink } from "./link";
import * as Tooltip from "@radix-ui/react-tooltip";

const LINKS = [
  {
    name: "Github",
    icon: <GitHubLogoIcon className="h-8 w-8" xlinkTitle="Github" />,
    to: "https://github.com/nichtsam",
  },
];

export const Footer = () => {
  return (
    <div className="flex justify-center py-4">
      <NavigationMenu.Root>
        <NavigationMenu.List className="text-3xl font-bold">
          {LINKS.map((link) => (
            <NavigationMenu.Item key={link.to}>
              <Tooltip.Root>
                <Tooltip.Trigger>
                  <NavLink
                    aria-label={link.name}
                    prefetch="intent"
                    to={link.to}
                  >
                    {link.icon}
                  </NavLink>
                </Tooltip.Trigger>
                <Tooltip.Content>
                  <Tooltip.Content
                    className="bg-inverse text-inverse rounded px-2 py-1 text-sm"
                    sideOffset={5}
                  >
                    {link.name}
                    <Tooltip.Arrow className="fill-bg-invert" />
                  </Tooltip.Content>
                </Tooltip.Content>
              </Tooltip.Root>
            </NavigationMenu.Item>
          ))}
        </NavigationMenu.List>
      </NavigationMenu.Root>
    </div>
  );
};
