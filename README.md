# nichtsam.com — ink sketch edition

My personal website, drawn in pen and ink. The home page is a hand-drawn street
where every building leads somewhere: the bookshop holds the articles, the
workshop is GitHub, the tower is LinkedIn. The street draws itself when the page
loads; three little characters walk the sidewalk and jump when you click the
street. Click the windows to switch the lights, knock on the little house, and
switch to night for white ink on black.

Production: https://nichtsam.com · Staging: https://staging.nichtsam.com

## Stack

- Framework: [Remix 3](https://remix.run/) (`remix@3.0.0-rc.3`) — routes,
  controllers, server rendering and hydrated `clientEntry` components, no
  bundler or build step
- Content: Markdown in [`content/articles`](./content/articles), rendered with
  [marked](https://marked.js.org/) and highlighted with [Shiki](https://shiki.style/)
- Drawing: [roughjs](https://roughjs.com/) generates every sketchy line on the
  server with fixed seeds ([`app/ui/sketch.tsx`](./app/ui/sketch.tsx),
  [`app/ui/street-scene.tsx`](./app/ui/street-scene.tsx)); the browser only
  toggles classes on the rendered SVG
- Styling: CSS tokens in [`app/ui/public/site.css`](./app/ui/public/site.css)
  plus Remix's `css()` mixin
- Deployment: [Fly.io](https://fly.io/)

## Development

Requires Node.js >= 24.3 and pnpm 10.

```sh
pnpm install
pnpm dev        # http://localhost:3000
pnpm hmr        # with hot module reloading
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
  router.ts               Middleware + controller mapping
  assets.ts               On-demand browser asset server
  actions/                Controllers and route-owned pages
  content/articles.ts     Markdown loading and rendering
  ui/                     Shared layout and server components
  ui/public/              Browser code: scene controls, theme toggle, effects
content/articles/         Articles (files starting with `_` are ignored)
public/                   Static files served as-is
```

## Writing an article

Copy [`content/articles/_template.mdx`](./content/articles/_template.mdx) to
`content/articles/<slug>.md` and fill in the frontmatter. Drafts
(`draft: true`) only show up in development.

## Deployment

[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) checks every push
and pull request, and deploys `main` to production and `dev` to staging on
Fly.io. It needs a `FLY_API_TOKEN` repository secret.
