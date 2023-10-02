import { cssBundleHref } from "@remix-run/css-bundle";
import appStylesheet from "@/styles/app.css";
import {
  json,
  type LinksFunction,
  type LoaderFunctionArgs,
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
import clsx from "clsx";
import { publicEnv, forceEnvValidation } from "@/utils/env.server.ts";
import { FaviconMeta, faviconLinks } from "@/utils/favicon.tsx";
import { ToasterWithPageLoading } from "./components/ui/toaster.tsx";
import { useNonce } from "./utils/nonce-provider.tsx";
import DOMPurify from "isomorphic-dompurify";
import { ClientHintsCheck, getHints } from "./utils/client-hints.tsx";
import { getTheme, type Theme } from "./utils/theme.server.ts";
import { useTheme } from "./utils/theme.ts";
import { TooltipProvider } from "./components/ui/tooltip.tsx";
import { GeneralErrorBoundary } from "./components/error-boundary.tsx";

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
  { rel: "stylesheet", href: appStylesheet },
  { rel: "manifest", href: "/site.webmanifest" },
  ...faviconLinks,
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  forceEnvValidation();

  return json({
    env: publicEnv,
    requestInfo: {
      hints: getHints(request),
      userPreferences: {
        theme: getTheme(request),
      },
    },
  });
};

function Document({
  children,
  nonce,
  theme = "light",
  env = {},
}: {
  children: React.ReactNode;
  nonce: string;
  theme?: Theme;
  env?: Record<string, string>;
}) {
  return (
    <html lang="en" className={clsx(theme, "relative")}>
      <head>
        <ClientHintsCheck nonce={nonce} />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <FaviconMeta />

        <Meta />
        <Links />
      </head>
      <body suppressHydrationWarning>
        {children}

        <ToasterWithPageLoading />

        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(`window.ENV = ${JSON.stringify(env)}`, {
              RETURN_TRUSTED_TYPE: true,
            }),
          }}
        />
        <Scripts nonce={nonce} />
        <ScrollRestoration nonce={nonce} />
        <LiveReload nonce={nonce} />
      </body>
    </html>
  );
}

export function App() {
  const data = useLoaderData<typeof loader>();
  const nonce = useNonce();
  const env = data.env;
  const theme = useTheme();

  return (
    <Document nonce={nonce} env={env} theme={theme}>
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
  return (
    <TooltipProvider>
      <App />
    </TooltipProvider>
  );
}

export function ErrorBoundary() {
  // the nonce doesn't rely on the loader so we can access that
  const nonce = useNonce();

  // NOTE: you cannot use useLoaderData in an ErrorBoundary because the loader
  // likely failed to run so we have to do the best we can.
  // We could probably do better than this (it's possible the loader did run).
  // This would require a change in Remix.

  // Just make sure your root route never errors out and you'll always be able
  // to give the user a better UX.

  return (
    <Document nonce={nonce}>
      <GeneralErrorBoundary />
    </Document>
  );
}
