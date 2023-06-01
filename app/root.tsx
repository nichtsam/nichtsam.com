import { cssBundleHref } from "@remix-run/css-bundle";
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
import stylesheet from "~/tailwind.css";
import { NavBar } from "./components/navbar";
import { Footer } from "./components/footer";
import * as Tooltip from "@radix-ui/react-tooltip";
import {
  FixFlashOfWrongTheme,
  ThemeProvider,
  useTheme,
} from "./utils/theme-provider";
import clsx from "clsx";
import { getThemeSession } from "./utils/theme.server";
import { publicEnv, forceEnvValidation } from "./utils/env.server";

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
  { rel: "stylesheet", href: stylesheet },
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

export function App() {
  const data = useLoaderData<typeof loader>();
  const [theme] = useTheme();

  return (
    <html lang="en" className={clsx(theme, "relative h-full")}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        <FixFlashOfWrongTheme ssrTheme={Boolean(data.theme)} />
      </head>
      <body className="flex h-full flex-col">
        <header>
          <NavBar />
        </header>

        <main className="flex-1">
          <Outlet />
        </main>

        <footer>
          <Footer />
        </footer>

        <ScrollRestoration />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(data.env)}`,
          }}
        />
        <Scripts />
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
