import { ExternalLink } from "#app/components/link.tsx";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "./ui/navigation-menu.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip.tsx";
import { Button } from "./ui/button.tsx";
import { Icon } from "./ui/icon.tsx";

const LINKS = [
  {
    name: "Github",
    to: "https://github.com/nichtsam",
    icon: <Icon name="github-logo" />,
  },
  {
    name: "LinkedIn",
    to: "https://www.linkedin.com/in/nichtsam/",
    icon: <Icon name="linkedin-logo" />,
  },
];

export const Footer = () => {
  return (
    <div className="flex justify-center py-4">
      <NavigationMenu>
        <NavigationMenuList>
          {LINKS.map(({ to, name, icon }) => (
            <NavigationMenuItem key={to}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" asChild>
                    <ExternalLink href={to} aria-label={name}>
                      {icon}
                    </ExternalLink>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{name}</p>
                </TooltipContent>
              </Tooltip>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
};
