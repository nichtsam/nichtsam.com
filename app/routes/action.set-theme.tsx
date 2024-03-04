import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { parseWithZod } from "@conform-to/zod";
import { z } from "zod";
import { setTheme } from "#app/utils/theme.server.ts";
import {
  GeneralErrorBoundary,
  generalNotFoundHandler,
} from "#app/components/error-boundary.tsx";

export const ThemeFormSchema = z.object({
  theme: z.enum(["system", "light", "dark"]),
});

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const submission = parseWithZod(formData, {
    schema: ThemeFormSchema,
  });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 },
    );
  }

  const { theme } = submission.value;

  const responseInit = {
    headers: { "set-cookie": setTheme(theme) },
  };
  return json({ result: submission.reply() }, responseInit);
};

export async function loader() {
  throw new Response("Not found", { status: 404 });
}

export function ErrorBoundary() {
  return (
    <GeneralErrorBoundary
      statusHandlers={{
        404: generalNotFoundHandler,
      }}
    />
  );
}
