import { useRevalidator } from "@remix-run/react";
import { useEffect } from "react";
import { parse as parseCookie } from "cookie";
import type { Theme } from "./theme.server.ts";

type ClientHintConfigSchema = {
  cookieName: string;
  getValueCode: string;
  fallback: string;
  transform?: (value: string) => string;
};

const clientHintConfigs = {
  theme: {
    cookieName: "CH-prefers-color-scheme",
    getValueCode: `window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'`,
    fallback: "light",
    transform(value: string): Theme {
      return value === "dark" ? "dark" : "light";
    },
  },
  timeZone: {
    cookieName: "CH-time-zone",
    getValueCode: `Intl.DateTimeFormat().resolvedOptions().timeZone`,
    fallback: "UTC",
  },
} satisfies {
  [key: string]: ClientHintConfigSchema;
};

type ClientHintsConfigKey = keyof typeof clientHintConfigs;

type ClientHints = {
  [key in ClientHintsConfigKey]: (typeof clientHintConfigs)[key] extends {
    transform: (value: any) => infer ReturnValue;
  }
    ? ReturnValue
    : (typeof clientHintConfigs)[key]["fallback"];
};

export const getHints = (request?: Request): ClientHints => {
  const cookieString =
    typeof document !== "undefined"
      ? document.cookie
      : typeof request !== "undefined"
        ? request?.headers.get("Cookie") ?? ""
        : "";

  const cookies = parseCookie(cookieString);

  return Object.entries(clientHintConfigs).reduce((acc, [hintKey, hint]) => {
    const cookie = cookies[hint.cookieName];
    const cookieValue = cookie ? decodeURIComponent(cookie) : null;

    if ("transform" in hint) {
      acc[hintKey as ClientHintsConfigKey] = hint.transform(
        cookieValue ?? hint.fallback,
      );
    } else {
      // @ts-expect-error
      acc[hintKey] = cookieValue ?? hint.fallback;
    }

    return acc;
  }, {} as ClientHints);
};

export const ClientHintsCheck = ({ nonce }: { nonce: string }) => {
  const { revalidate } = useRevalidator();

  useEffect(() => {
    const themeQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function handleThemeChange() {
      document.cookie = `${clientHintConfigs.theme.cookieName}=${
        themeQuery.matches ? "dark" : "light"
      }`;
      revalidate();
    }

    themeQuery.addEventListener("change", handleThemeChange);
    return () => {
      themeQuery.removeEventListener("change", handleThemeChange);
    };
  }, [revalidate]);

  return (
    <script
      nonce={nonce}
      dangerouslySetInnerHTML={{
        __html: `
const cookies = document.cookie.split(';').reduce((acc,cur) => {
  const [cookieName, cookieValue] = cur.trim().split('=');
  acc[cookieName] = cookieValue;
  return acc;
},{});

const hints = [
  ${Object.values(clientHintConfigs)
    .map((hint) => {
      const cookieName = JSON.stringify(hint.cookieName);
      return `{cookieName: ${cookieName}, actual: ${hint.getValueCode}}`;
    })
    .join(",\n")}
];

let cookieChanged = false;
for (const hint of hints) {
    const cookie = cookies[hint.cookieName];
    if (decodeURIComponent(cookie) !== hint.actual) {
      document.cookie = encodeURIComponent(hint.cookieName) + '=' + encodeURIComponent(hint.actual) + ';path=/';
      cookieChanged = true;
    }
}

if (cookieChanged && navigator.cookieEnabled) {
  window.location.reload();
}
  `,
      }}
    />
  );
};
