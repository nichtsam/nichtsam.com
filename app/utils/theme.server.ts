import { createCookieSessionStorage } from "@remix-run/node";
import type { Theme } from "./theme-provider.tsx";
import { isTheme } from "./theme-provider.tsx";
import { env } from "./env.server.ts";

const sessionSecret = env.SESSION_SECRET;

const themeStorage = createCookieSessionStorage({
  cookie: {
    name: "theme",
    secure: true,
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    httpOnly: true,
  },
});

export async function getThemeSession(request: Request) {
  const session = await themeStorage.getSession(request.headers.get("Cookie"));
  return {
    getTheme: () => {
      const themeValue = session.get("theme");
      return isTheme(themeValue) ? themeValue : null;
    },
    setTheme: (theme: Theme) => session.set("theme", theme),
    commit: () => themeStorage.commitSession(session),
  };
}
