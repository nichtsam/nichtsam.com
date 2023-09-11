import { cssBundleHref } from "@remix-run/css-bundle";
import appStylesheet from "@/styles/app.css";
import radixColorsStylesheet from "@/styles/radix-colors.css";
import type {
  LinksFunction,
  LoaderArgs,
  LoaderFunction,
} from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { NavBar } from "@/components/navbar/index.tsx";
import { Footer } from "@/components/footer.tsx";
import * as Tooltip from "@radix-ui/react-tooltip";
import {
  FixFlashOfWrongTheme,
  ThemeProvider,
  useTheme,
} from "@/utils/theme-provider.tsx";
import clsx from "clsx";
import { getThemeSession } from "@/utils/theme.server.ts";
import { publicEnv, forceEnvValidation } from "@/utils/env.server.ts";
import { FaviconMeta, faviconLinks } from "@/utils/favicon.tsx";
import { ToasterWithPageLoading } from "./components/ui/toaster.tsx";

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
  { rel: "stylesheet", href: radixColorsStylesheet },
  { rel: "stylesheet", href: appStylesheet },
  { rel: "manifest", href: "/site.webmanifest" },
  ...faviconLinks,
];

export const loader: LoaderFunction = async ({ request }: LoaderArgs) => {
  forceEnvValidation();

  const themeSession = await getThemeSession(request);

  const data = {
    theme: themeSession.getTheme(),
    env: publicEnv,
  };

  return data;
};

function App() {
  const data = useLoaderData<typeof loader>();
  const [theme] = useTheme();

  return (
    <html lang="en" className={clsx(theme, "relative")}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <FaviconMeta />

        <Meta />
        <Links />
        <FixFlashOfWrongTheme ssrTheme={Boolean(data.theme)} />
      </head>
      <body className="flex h-full min-h-screen flex-col">
        <header>
          <NavBar />
        </header>

        <main className="flex-1">
          <Outlet />
        </main>

        <footer>
          <Footer />
        </footer>

        <ToasterWithPageLoading />

        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(data.env)}`,
          }}
        />
        <Scripts />
        <ScrollRestoration />
        <LiveReload />
      </body>
    </html>
  );
}

export default function AppWithProviders() {
  const data = useLoaderData<typeof loader>();

  return (
    <ThemeProvider specifiedTheme={data.theme}>
      <Tooltip.Provider>
        <App />
      </Tooltip.Provider>
    </ThemeProvider>
  );
}
