import "dotenv/config";
import crypto from "crypto";
import { createRequestHandler } from "@remix-run/express";
import { installGlobals } from "@remix-run/node";
import compression from "compression";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import sourceMapSupport from "source-map-support";
import getPort, { portNumbers } from "get-port";
import chalk from "chalk";
import { printUrls } from "./server-utils.js";

const MODE = process.env.NODE_ENV ?? "development";
const ALLOW_INDEXING = process.env.ALLOW_INDEXING === "true";

sourceMapSupport.install();
installGlobals();

const viteDevServer =
  MODE === "production"
    ? undefined
    : await import("vite").then((vite) =>
        vite.createServer({
          server: { middlewareMode: true },
        }),
      );

const app = express();

app.use(compression());

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by");

app.use(morgan("tiny"));

app.use((_, res, next) => {
  res.locals.cspNonce = crypto.randomBytes(16).toString("hex");
  next();
});

app.use(
  helmet({
    referrerPolicy: { policy: "same-origin" },
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        "connect-src": [
          MODE === "development" ? "ws:" : null,
          process.env.SENTRY_DSN ? "*.ingest.sentry.io" : null,
          "'self'",
        ].filter(Boolean),
        "font-src": ["'self'"],
        "frame-src": ["'self'"],
        "img-src": [
          "'self'",
          "data:",
          "avatars.githubusercontent.com",
          "cdn.discordapp.com",
          "res.cloudinary.com",
        ],
        "form-action": ["'self'", "github.com/login/oauth/authorize"],
        "script-src": [
          "'strict-dynamic'",
          "'self'",
          (_, res) => `'nonce-${res.locals.cspNonce}'`,
          "'unsafe-inline'", // backward compatibility for 'nonces'
          "https:", // backward compatibility for 'strict-dynamic'
          "'unsafe-eval'", // mdx-bundler needs this
        ],
        "script-src-attr": [(_, res) => `'nonce-${res.locals.cspNonce}'`],
        "upgrade-insecure-requests": null,
      },
    },
  }),
);

if (!ALLOW_INDEXING) {
  app.use((_, res, next) => {
    res.set("X-Robots-Tag", "noindex, nofollow");
    next();
  });
}

// handle asset requests
if (viteDevServer) {
  app.use(viteDevServer.middlewares);
} else {
  app.use(
    "/assets",
    express.static("build/client/assets", {
      immutable: true,
      maxAge: "1y",
    }),
  );
}
app.use(express.static("build/client", { maxAge: "1h" }));

// handle SSR requests
app.all(
  "*",
  createRequestHandler({
    getLoadContext: (_, res) => ({ cspNonce: res.locals.cspNonce }),
    build: viteDevServer
      ? () => viteDevServer.ssrLoadModule("virtual:remix/server-build")
      : await import("./build/server/index.js"),
  }),
);

const desiredPort = Number(process.env.PORT || 3000);
const portToUse = await getPort({
  port: portNumbers(desiredPort, desiredPort + 100),
});

const server = app.listen(portToUse, async () => {
  const addr = server.address();
  const portUsed = typeof addr === "object" ? addr.port : addr;

  if (portUsed !== desiredPort) {
    console.warn(
      chalk.yellow(
        `⚠️  Port ${desiredPort} is not available, using ${portUsed} instead.`,
      ),
    );
  }

  console.log(`🚀 App started`);

  printUrls(portUsed);

  console.log(chalk.bold("Press Ctrl+C to stop"));
});
