import { useFetcher, useFetchers } from "@remix-run/react";
import { useRequestInfo } from "./request-info.ts";
import { parseWithZod } from "@conform-to/zod";
import { useHints } from "./client-hints.tsx";
import { z } from "zod";
import { useEffect, useState } from "react";
import { type setTheme as setThemeAction } from "./theme.server.ts";
import { getFormProps, useForm } from "@conform-to/react";
import { LaptopIcon, MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { Button } from "#app/components/ui/button.tsx";
import { unvariant } from "./misc.ts";

export const SET_THEME_INTENT = "set-theme";

export const ThemeFormSchema = z.object({
  theme: z.enum(["system", "light", "dark"]),
});

export const useTheme = () => {
  const requestInfo = useRequestInfo();
  const hints = useHints();

  const optimisticMode = useOptimisticThemeMode();
  if (optimisticMode) {
    return optimisticMode === "system" ? hints.theme : optimisticMode;
  }

  return requestInfo.userPreferences.theme ?? hints.theme;
};

export function useOptimisticThemeMode() {
  const fetchers = useFetchers();
  const themeFetcher = fetchers.find(
    (f) => f.formAction === "/action/set-theme",
  );

  if (themeFetcher && themeFetcher.formData) {
    const submission = parseWithZod(themeFetcher.formData, {
      schema: ThemeFormSchema,
    });

    if (submission.status === "success") {
      return submission.value.theme;
    }
  }
}

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
    <fetcher.Form method="POST" action="/" {...getFormProps(form)}>
      <input type="hidden" name="theme" value={nextMode} />

      <Button
        name="intent"
        value={SET_THEME_INTENT}
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
