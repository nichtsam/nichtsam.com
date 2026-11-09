# Welcome to nichtsam.com!

Production : https://nichtsam.com

## Stack

- Framework: [React Router 7](https://reactrouter.com/)
- Deployment:
  [Cloudflare Workers static assets](https://developers.cloudflare.com/workers/static-assets/)
- Styling: [Tailwind CSS](https://tailwindcss.com/)

## System Requirement

- [Node.js](https://nodejs.org/) 24
- [Pnpm](https://pnpm.io/) 10

## Development

### Setup

1. Copy `.env.example` into `.env`
2. run `pnpm i`
3. run `pnpm dev`
4. open up `http://localhost:5173`

To preview the production build, run `pnpm build` and then `pnpm start`.

## Deployment

Every page is prerendered at build time, and the Worker in
[`wrangler.jsonc`](wrangler.jsonc) serves the files in `build/client`. This
repository has a [Github Workflow](.github/workflows/deploy.yml) set up to
deploy automatically from `main`. \
If you want to deploy manually, run `pnpm build` and then
`pnpm exec wrangler deploy`.

## Make it yours

### Infra

- [sign up on Cloudflare](https://dash.cloudflare.com/sign-up)
- change `name` in [`wrangler.jsonc`](wrangler.jsonc)
- set up
  [secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository)
  needed by [project's Github Workflows](./.github/workflows/).
  - [`CLOUDFLARE_API_TOKEN`](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/),
    made from the "Edit Cloudflare Workers" template
  - `CLOUDFLARE_ACCOUNT_ID`
- attach your domain as a
  [Custom Domain](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
  of the Worker

### Content

Here are some stuff you will need to adjust to make it your website.

#### Articles

- `/content/articles` \
  Written in md or mdx, every file is an article. Files starting with `_` are
  skipped.

#### Favicons

- `public/favicon.ico`
- `public/favicons`
- related fields in `public/site.webmanifest`

#### Logo

- `Logo` in `app/components/site-header.tsx`

#### Pages' Meta

- `meta()` in every route

#### Social Links

- `socialNav` in `app/config/nav.tsx`
