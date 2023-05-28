import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import stylesheet from "~/tailwind.css";
import { NavBar } from "./components/navbar";
import { Footer } from "./components/footer";
import * as Tooltip from "@radix-ui/react-tooltip";

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
  { rel: "stylesheet", href: stylesheet },
];

export function App() {
  return (
    <html lang="en" className="relative h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
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
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export default function AppWithProviders() {
  return (
    <Tooltip.Provider>
      <App />
    </Tooltip.Provider>
  );
}
