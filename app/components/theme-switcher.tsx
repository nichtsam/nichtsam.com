import { LaptopIcon, MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useFetcher } from "@remix-run/react";
import { useForm, getFormProps } from "@conform-to/react";
import type { action as setThemeAction } from "#app/routes/action.set-theme.tsx";
import { useOptimisticThemeMode } from "#app/utils/theme.ts";
import { useRequestInfo } from "#app/utils/request-info.ts";
import { Button } from "./ui/button.tsx";
import { useEffect, useState } from "react";
import { unvariant } from "#app/utils/misc.ts";

export const ThemeSwitcher = () => {
  const [clientJavascriptEnable, setClientJavascriptEnable] = useState(false);

  const {
    userPreferences: { theme: themPreference },
  } = useRequestInfo();
  const fetcher = useFetcher<typeof setThemeAction>();

  const [form] = useForm({
    id: "theme-switch",
    lastResult: fetcher.data?.result,
  });

  const optimisticMode = useOptimisticThemeMode();
  const mode = optimisticMode ?? themPreference ?? "system";
  const nextMode =
    mode === "system" ? "light" : mode === "light" ? "dark" : "system";
  const modeLabel = {
    light: <SunIcon className="animate-in fade-in" />,
    dark: <MoonIcon className="animate-in fade-in" />,
    system: <LaptopIcon className="animate-in fade-in" />,
  };

  useEffect(() => {
    setClientJavascriptEnable(true);
  }, []);

  return (
    <fetcher.Form
      method="POST"
      action="/action/set-theme"
      {...getFormProps(form)}
    >
      <input type="hidden" name="theme" value={nextMode} />

      <Button
        type="submit"
        size="icon"
        variant="ghost"
        aria-label="Dark Mode Toggler"
        disabled={!clientJavascriptEnable}
        className={unvariant(
          !clientJavascriptEnable,
          "disabled:pointer-events-auto",
        )}
        title={unvariant(
          !clientJavascriptEnable,
          "Theme switching is disabled due to lack of JavaScript support. Please enable JavaScript or use a browser that supports it to enable this feature.",
        )}
      >
        {modeLabel[nextMode]}
      </Button>
    </fetcher.Form>
  );
};
