// import * as Switch from "@radix-ui/react-switch";
import { Theme, useTheme } from "@/utils/theme-provider.tsx";
import { Button } from "./ui/button.tsx";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";

export const ThemeSwitcher = () => {
  const [theme, setTheme] = useTheme();

  return (
    <Button
      size="icon"
      variant="ghost"
      aria-label="Dark Mode Toggler"
      onClick={() => {
        setTheme((prevTheme) =>
          prevTheme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT,
        );
      }}
    >
      {theme === Theme.LIGHT ? <MoonIcon /> : <SunIcon />}
    </Button>
  );
};
