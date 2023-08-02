import { cssBundleHref } from "@remix-run/css-bundle";
import tailwindStylesheet from "~/styles/tailwind.css";
import appStylesheet from "~/styles/app.css";
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
  useNavigation,
} from "@remix-run/react";
import { NavBar } from "./components/navbar";
import { Footer } from "./components/footer";
import * as Tooltip from "@radix-ui/react-tooltip";
import * as Toast from "@radix-ui/react-toast";
import {
  FixFlashOfWrongTheme,
  ThemeProvider,
  useTheme,
} from "./utils/theme-provider";
import clsx from "clsx";
import { getThemeSession } from "./utils/theme.server";
import { publicEnv, forceEnvValidation } from "./utils/env.server";
import { FaviconMeta, faviconLinks } from "./utils/favicon";
import { RocketIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { useSpinDelay } from "spin-delay";

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
  { rel: "stylesheet", href: appStylesheet },
  { rel: "stylesheet", href: tailwindStylesheet },
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
        <PageLoadingMessage />

        <header>
          <NavBar />
        </header>

        <main className="flex-1">
          <Outlet />
        </main>

        <footer>
          <Footer />
        </footer>

        <Toast.Viewport className="fixed bottom-0 right-0 z-[2147483647] flex w-96 max-w-[100vw] flex-col p-6" />

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
        <Toast.Provider>
          <App />
        </Toast.Provider>
      </Tooltip.Provider>
    </ThemeProvider>
  );
}

// we don't want to show the loading indicator on page load
let firstRender = true;

function PageLoadingMessage() {
  const navigation = useNavigation();
  const [pendingPath, setPendingPath] = useState("");
  const showLoader = useSpinDelay(Boolean(navigation.state !== "idle"), {
    delay: 400,
    minDuration: 1000,
  });

  useEffect(() => {
    if (firstRender) return;
    if (navigation.state === "idle") return;
    setPendingPath(navigation.location.pathname);
  }, [navigation]);

  useEffect(() => {
    firstRender = false;
  }, []);

  return (
    <Toast.Root
      open={showLoader}
      className="rounded-md border-2 border-gray-7 bg-gray-3 p-5"
    >
      <div className="grid [grid-template-areas:'icon_title'_'icon_description'] [grid-template-columns:52px_auto]">
        <RocketIcon className="text-primary h-8 w-8 animate-wiggle self-center [grid-area:icon]" />
        <Toast.Title className="text-primary text-lg font-bold [grid-area:title]">
          Loading
        </Toast.Title>
        <Toast.Description className="text-secondary truncate text-sm font-bold [grid-area:description]">
          Path: {pendingPath}
        </Toast.Description>
      </div>
    </Toast.Root>
  );
}
