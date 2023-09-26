import { cssBundleHref } from "@remix-run/css-bundle";
import appStylesheet from "@/styles/app.css";
import radixColorsStylesheet from "@/styles/radix-colors.css";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
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
import { useNonce } from "./utils/nonce-provider.tsx";
import DOMPurify from "isomorphic-dompurify";
import { ClientHintsCheck, getHints } from "./utils/client-hints.tsx";

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
  { rel: "stylesheet", href: radixColorsStylesheet },
  { rel: "stylesheet", href: appStylesheet },
  { rel: "manifest", href: "/site.webmanifest" },
  ...faviconLinks,
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  forceEnvValidation();

  const themeSession = await getThemeSession(request);

  const data = {
    theme: themeSession.getTheme(),
    env: publicEnv,
    requestInfo: {
      hints: getHints(request),
    },
  };

  return data;
};

function Document({ children }: { children: React.ReactNode }) {
  const data = useLoaderData<typeof loader>();
  const [theme] = useTheme();
  const nonce = useNonce();

  return (
    <html lang="en" className={clsx(theme, "relative")}>
      <head>
        <ClientHintsCheck nonce={nonce} />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <FaviconMeta />

        <Meta />
        <Links />
        <FixFlashOfWrongTheme ssrTheme={Boolean(data.theme)} nonce={nonce} />
      </head>
      <body suppressHydrationWarning>
        {children}

        <ToasterWithPageLoading />

        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(
              `window.ENV = ${JSON.stringify(data.env)}`,
              {
                RETURN_TRUSTED_TYPE: true,
              },
            ),
          }}
        />
        <Scripts nonce={nonce} />
        <ScrollRestoration nonce={nonce} />
        <LiveReload nonce={nonce} />
      </body>
    </html>
  );
}

function App() {
  return (
    <Document>
      <div className="flex h-full min-h-screen flex-col">
        <header>
          <NavBar />
        </header>

        <main className="flex-1">
          <Outlet />
        </main>

        <footer>
          <Footer />
        </footer>
      </div>
    </Document>
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
