# Welcome to nichtsam.com!

Production : https://nichtsam.com

## Stack

- Framework: [Astro](https://astro.build/)
- Deployment:
  [Cloudflare Workers static assets](https://developers.cloudflare.com/workers/static-assets/)
- Styling: [Tailwind CSS](https://tailwindcss.com/)

## System Requirement

- [Node.js](https://nodejs.org/) 24
- [Pnpm](https://pnpm.io/) 10

## Development

### Setup

1. run `pnpm i`
2. run `pnpm dev`
3. open up `http://localhost:4321`

To preview the production build, run `pnpm build` and then `pnpm start`.

## Deployment

Every page is prerendered at build time, and the Worker in
[`wrangler.jsonc`](wrangler.jsonc) serves the files in `dist`. The Worker is
connected to this repository with
[Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/), which
type checks, builds and deploys every push to `main`. \
If you want to deploy manually, run `pnpm build` and then
`pnpm exec wrangler deploy`.

## Make it yours

### Infra

- [sign up on Cloudflare](https://dash.cloudflare.com/sign-up)
- change `name` in [`wrangler.jsonc`](wrangler.jsonc)
- change `site` in [`astro.config.ts`](astro.config.ts) to your domain
- connect your repository to the Worker with
  [Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/),
  using `pnpm build` as the build command
- attach your domain as a
  [Custom Domain](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
  of the Worker

### Content

Here are some stuff you will need to adjust to make it your website.

#### Articles

- `/content/articles` \
  Written in Markdown, every file is an article. Files starting with `_` are
  skipped.

#### Favicons

- `public/favicon.ico`
- `public/favicons`

#### Logo

- the logo in `src/components/SiteHeader.astro`

#### Pages' Meta

- `title` and `description` passed to `Layout` in every page

#### Social Links

- `socialNav` in `src/components/SiteFooter.astro`
