# Welcome to nichtsam.com!

Production : https://nichtsam.com  
Staging : https://staging.nichtsam.com

## Stack

- Framework: [React Router 7](https://reactrouter.com/)
- Deployment: [Fly.io](https://fly.io/)
- Styling: [Tailwind CSS](https://tailwindcss.com/)

## System Requirement

- [Node.js](https://nodejs.org/) 24
- [Pnpm](https://pnpm.io/) 10

## Development

### Setup

1. Copy `.env.example` into `.env`
2. run `pnpm i`
3. run `pnpm dev`
4. open up `http://localhost:3000`

## Deployment

This repository has a [Github Workflow](.github/workflows/deploy.yml) set up to
deploy automatically. \
If you want to deploy manually, refer to
[Deploy a Fly App](https://fly.io/docs/apps/deploy/).

## Make it yours

### Infra

- [sign up on fiy.io](https://fly.io/docs/hands-on/)
- [setup deployment for fly.io](https://fly.io/docs/apps/launch/)
- set up
  [secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository)
  needed by [project's Github Workflows](./.github/workflows/).
  - [`FLY_API_TOKEN`](https://fly.io/docs/app-guides/continuous-deployment-with-github-actions/#api-tokens)
  - `SENTRY_AUTH_TOKEN` (optional, uploads source maps to Sentry)

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
