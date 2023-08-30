import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { isTheme } from "@/utils/theme-provider.tsx";
import { getThemeSession } from "@/utils/theme.server.ts";

export const action = async ({ request }: ActionArgs) => {
  const themeSession = await getThemeSession(request);
  const requestText = await request.text();
  const form = new URLSearchParams(requestText);
  const theme = form.get("theme");

  if (!isTheme(theme)) {
    return json({
      success: false,
      message: `theme value of ${theme} is not a valid theme`,
    });
  }

  themeSession.setTheme(theme);
  return json(
    { success: true },
    { headers: { "Set-Cookie": await themeSession.commit() } },
  );
};

export const loader = () => {
  throw new Response(null, {
    status: 404,
    statusText: "Not Found",
  });
};

// This is to get the default 404 page of remix.
export default function Nothing() {}
