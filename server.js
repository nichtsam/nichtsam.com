import * as fs from "node:fs";
import os from "os";
import crypto from "crypto";
import { createRequestHandler } from "@remix-run/express";
import { broadcastDevReady, installGlobals } from "@remix-run/node";
import compression from "compression";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import sourceMapSupport from "source-map-support";

sourceMapSupport.install();
installGlobals();

const MODE = process.env.NODE_ENV;

const BUILD_PATH = "./build/index.js";
/**
 * @type { import('@remix-run/node').ServerBuild | Promise<import('@remix-run/node').ServerBuild> }
 */
let build = await import(BUILD_PATH);

const app = express();

app.use(compression());

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by");

// Remix fingerprints its assets so we can cache forever.
app.use(
  "/build",
  express.static("public/build", { immutable: true, maxAge: "1y" }),
);

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static("public", { maxAge: "1h" }));

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
        "img-src": ["'self'", "data:", "avatars.githubusercontent.com"],
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

function getRequestHandler(build) {
  function getLoadContext(_, res) {
    return { cspNonce: res.locals.cspNonce };
  }
  return createRequestHandler({ build, mode: MODE, getLoadContext });
}

app.all(
  "*",
  MODE === "development"
    ? await createDevRequestHandler()
    : getRequestHandler(build),
);

const port = process.env.PORT || 3000;
app.listen(port, async () => {
  let address =
    process.env.HOST ||
    Object.values(os.networkInterfaces())
      .flat()
      .find((ip) => String(ip?.family).includes("4") && !ip?.internal)?.address;

  if (!address) {
    console.log(`Remix App Server started at http://localhost:${port}`);
  } else {
    console.log(
      `Remix App Server started at http://localhost:${port} (http://${address}:${port})`,
    );
  }

  if (MODE === "development") {
    broadcastDevReady(build);
  }
});

async function createDevRequestHandler() {
  const chokidar = await import("chokidar");
  const watcher = chokidar.watch(BUILD_PATH, { ignoreInitial: true });

  watcher.on("all", async () => {
    // 1. purge require cache && load updated server build
    const stat = fs.statSync(BUILD_PATH);
    build = import(BUILD_PATH + "?t=" + stat.mtimeMs);
    // 2. tell dev server that this app server is now ready
    broadcastDevReady(await build);
  });

  return async (req, res, next) => {
    try {
      return getRequestHandler(await build)(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}
