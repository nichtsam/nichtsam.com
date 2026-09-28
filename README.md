# nichtsam.com

My personal website: a page drawn in pencil, plus the articles I write.

The design spec lives in [`docs/spec.md`](./docs/spec.md).

## Stack

- Framework: [Remix 3](https://remix.run/) (`remix@3.0.0-rc.3`): routes,
  controllers, server rendering and hydrated `clientEntry` components, with no
  bundler or build step
- Drawing: a small seeded pencil ([`app/ui/public/pencil.ts`](./app/ui/public/pencil.ts))
  that draws every frame, line and doodle as SVG, on the server and in the browser
- Content: Markdown in [`content/articles`](./content/articles), rendered with
  [marked](https://marked.js.org/) and highlighted with [Shiki](https://shiki.style/)
- Styling: CSS tokens in [`app/ui/public/site.css`](./app/ui/public/site.css)
  plus Remix's `css()` mixin

Every page is plain server-rendered HTML that works without JavaScript; the
drawing-in, the page transition and the hero carousel are enhancements, and
all of them step aside for `prefers-reduced-motion`.

## Development

Requires Node.js >= 24.3 and pnpm 10.

```sh
pnpm install
pnpm dev        # http://localhost:3000, restarts on change
pnpm hmr        # same, with hot module reloading
pnpm test
pnpm typecheck
pnpm format
```

`pnpm start` runs the production server; there is no separate build step.

## Project layout

```txt
server.ts                 Node entry point
app/
  routes.ts               Route contract (typed hrefs)
  router.ts               Middleware and controller mapping
  middleware/theme.ts     Reads the theme cookie
  content/                Articles, projects, site settings
  actions/                Controllers and route pages
  ui/                     Document, layout and shared components
  ui/public/              Browser code: pencil, ink, transition, hero, theme toggle
content/articles/         Markdown articles
docs/spec.md              Design spec
```
