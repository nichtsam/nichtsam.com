import { GitHubLogoIcon, LinkedInLogoIcon } from "@radix-ui/react-icons";
import { ExternalLink } from "@/components/link.tsx";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "./ui/navigation-menu.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip.tsx";
import { Button } from "./ui/button.tsx";

const LINKS = [
  {
    name: "Github",
    to: "https://github.com/nichtsam",
    Icon: GitHubLogoIcon,
  },
  {
    name: "LinkedIn",
    to: "https://www.linkedin.com/in/nichtsam/",
    Icon: LinkedInLogoIcon,
  },
];

export const Footer = () => {
  return (
    <div className="flex justify-center py-4">
      <NavigationMenu>
        <NavigationMenuList>
          {LINKS.map(({ to, name, Icon }) => (
            <NavigationMenuItem key={to}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" asChild>
                    <ExternalLink href={to} aria-label={name}>
                      <Icon className="h-4 w-4" />
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
