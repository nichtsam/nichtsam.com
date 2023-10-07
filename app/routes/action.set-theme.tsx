import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { redirectBack } from "remix-utils/redirect-back";
import { parse } from "@conform-to/zod";
import { z } from "zod";
import { setTheme } from "@/utils/theme.server.ts";
import {
  GeneralErrorBoundary,
  generalNotFoundHandler,
} from "@/components/error-boundary.tsx";

export const ThemeFormSchema = z.object({
  theme: z.enum(["system", "light", "dark"]),
  noscript: z.literal("true").optional(),
});

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const submission = parse(formData, {
    schema: ThemeFormSchema,
  });

  const noscript = submission.value?.noscript;

  if (!submission.value || submission.intent !== "update-theme") {
    return json({ status: "error", submission } as const, { status: 400 });
  }

  const { theme } = submission.value;

  const responseInit = {
    headers: { "set-cookie": setTheme(theme) },
  };

  if (noscript) {
    throw redirectBack(request, {
      ...responseInit,
      fallback: "/",
    });
  } else {
    return json({ success: true, submission }, responseInit);
  }
};

export async function loader() {
  throw new Response("Not found", { status: 404 });
}

export default function NotFound() {
  // due to the loader, this component will never be rendered, but we'll return
  // the error boundary just in case.
  return <ErrorBoundary />;
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
