import appStylesheet from "#app/styles/app.css?url";
import { json } from "@remix-run/node";
import type {
  MetaFunction,
  LinksFunction,
  LoaderFunctionArgs,
} from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { NavBar } from "#app/components/navbar/index.tsx";
import { Footer } from "#app/components/footer.tsx";
import clsx from "clsx";
import {
  publicEnv,
  forceEnvValidation,
  type PublicEnv,
} from "#app/utils/env.server.ts";
import { FaviconMeta, faviconLinks } from "#app/utils/favicon.tsx";
import { useNonce } from "./utils/nonce-provider.tsx";
import { ClientHintsCheck, getHints } from "./utils/client-hints.tsx";
import { getTheme, type Theme } from "./utils/theme.server.ts";
import { useTheme } from "./utils/theme.ts";
import { TooltipProvider } from "./components/ui/tooltip.tsx";
import { GeneralErrorBoundary } from "./components/error-boundary.tsx";
import { NavProgress } from "./components/nav-progress.tsx";
import { getUserId, logout } from "./utils/auth.server.ts";
import { db } from "./utils/db.server.ts";
import { csrf } from "./utils/csrf.server.ts";
import { AuthenticityTokenProvider } from "remix-utils/csrf/react";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: appStylesheet },
  { rel: "manifest", href: "/site.webmanifest" },
  ...faviconLinks,
];

export const meta: MetaFunction = ({ data }) => [
  { title: data ? "nichtsam.com" : "Error | nichtsam" },
  { name: "description", content: `Samuel Jensen, aka nichtsam's website.` },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  forceEnvValidation();

  const userId = await getUserId(request);

  const user = userId
    ? (await db.query.userTable.findFirst({
        where: (userTable, { eq }) => eq(userTable.id, userId),
        with: {
          image: {
            columns: { id: true },
          },
        },
      })) ?? null
    : null;

  if (userId && !user) {
    console.info("something weird happened");
    await logout({ request });
  }

  const [csrfToken, csrfCookieHeader] = await csrf.commitToken();

  const headers = new Headers();

  if (csrfCookieHeader) {
    headers.append("set-cookie", csrfCookieHeader);
  }

  return json(
    {
      user,
      env: publicEnv,
      requestInfo: {
        hints: getHints(request),
        userPreferences: {
          theme: getTheme(request),
        },
      },
      csrfToken,
    },
    {
      headers,
    },
  );
};

function Document({
  children,
  nonce,
  theme = "light",
  env,
}: {
  children: React.ReactNode;
  nonce: string;
  theme?: Theme;
  env?: PublicEnv;
}) {
  return (
    <html lang="en" className={clsx(theme, "relative")}>
      <head>
        <ClientHintsCheck nonce={nonce} />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        {!env?.ALLOW_INDEXING && (
          <meta name="robots" content="noindex, nofollow" />
        )}
        <FaviconMeta />

        <Meta />
        <Links />
      </head>
      <body suppressHydrationWarning>
        {children}

        <NavProgress />

        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(env ?? {})}`,
          }}
        />
        <Scripts nonce={nonce} />
        <ScrollRestoration nonce={nonce} />
      </body>
    </html>
  );
}

function App() {
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
  const { csrfToken } = useLoaderData<typeof loader>();

  return (
    <AuthenticityTokenProvider token={csrfToken}>
      <TooltipProvider>
        <App />
      </TooltipProvider>
    </AuthenticityTokenProvider>
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
