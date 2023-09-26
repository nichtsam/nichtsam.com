import { LaptopIcon, MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useFetcher } from "@remix-run/react";
import { useForm, conform } from "@conform-to/react";
import type { action as setThemeAction } from "@/routes/action.set-theme.tsx";
import { useOptimisticThemeMode } from "@/utils/theme.ts";
import { useRequestInfo } from "@/utils/request-info.ts";
import { Button } from "./ui/button.tsx";

export const ThemeSwitcher = () => {
  const {
    userPreferences: { theme: themPreference },
  } = useRequestInfo();
  const fetcher = useFetcher<typeof setThemeAction>();

  const [form] = useForm({
    id: "theme-switch",
    lastSubmission: fetcher.data?.submission,
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

  return (
    <fetcher.Form method="POST" action="/action/set-theme" {...form.props}>
      <input type="hidden" name="theme" value={nextMode} />

      <Button
        name={conform.INTENT}
        value="update-theme"
        type="submit"
        size="icon"
        variant="ghost"
        aria-label="Dark Mode Toggler"
      >
        {modeLabel[nextMode]}
      </Button>

      {/* <ErrorList errors={form.errors} id={form.errorId} /> */}
    </fetcher.Form>
  );
};
