import { useFetchers } from "@remix-run/react";
import { useRequestInfo } from "./request-info.ts";
import { parseWithZod } from "@conform-to/zod";
import { ThemeFormSchema } from "#app/routes/action.set-theme.tsx";
import { useHints } from "./client-hints.tsx";

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
