import * as Switch from "@radix-ui/react-switch";
import clsx from "clsx";
import { Theme, useTheme } from "~/utils/theme-provider.tsx";

export const ThemeSwitcher = () => {
  const [, setTheme] = useTheme();

  return (
    <Switch.Root
      aria-label="Dark Mode Toggler"
      className="bg-inverse flex h-[25px] w-[50px] items-center rounded"
      onCheckedChange={() => {
        setTheme((prevTheme) =>
          prevTheme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT,
        );
      }}
    >
      <Switch.Thumb
        className={clsx(
          "bg-primary mr-auto block h-[15px] w-[15px] rounded-full",
          "translate-x-[5px] transition-transform data-[state=checked]:translate-x-[30px]",
        )}
      />
    </Switch.Root>
  );
};
