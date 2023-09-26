import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { parse } from "@conform-to/zod";
import { z } from "zod";
import { setTheme } from "@/utils/theme.server.ts";

export const ThemeFormSchema = z.object({
  theme: z.enum(["system", "light", "dark"]),
});

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const submission = parse(formData, {
    schema: ThemeFormSchema,
  });

  if (!submission.value || submission.intent !== "update-theme") {
    return json({ status: "error", submission } as const, { status: 400 });
  }
  const { theme } = submission.value;

  const responseInit = {
    headers: { "set-cookie": setTheme(theme) },
  };
  return json({ success: true, submission }, responseInit);
};
