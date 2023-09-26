import { parse as parseCookie, serialize as serializeCookie } from "cookie";

const cookieName = "theme";
export type Theme = "light" | "dark";

export const getTheme = (request: Request): Theme | null => {
  const cookieHeader = request.headers.get("Cookie");
  const parsed = cookieHeader ? parseCookie(cookieHeader)[cookieName] : "light";

  if (parsed === "light" || parsed === "dark") return parsed;

  return null;
};

export const setTheme = (theme: Theme | "system"): string => {
  if (theme === "system") {
    return serializeCookie(cookieName, "", { path: "/", maxAge: -1 });
  } else {
    return serializeCookie(cookieName, theme, { path: "/" });
  }
};
