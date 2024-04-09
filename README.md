# Welcome to nichtsam.com!

Production : https://nichtsam.com  
Staging : https://staging.nichtsam.com

## Stack

- Framework: [Remix](https://remix.run/)
- Deployment: [Fly.io](https://fly.io/)
- Styling: [Tailwind CSS](https://tailwindcss.com/)

## System Requirement

- [Node.js](https://nodejs.org/) >= 20
- [Pnpm](https://pnpm.io/) >= 8

## Development

### Setup

1. Copy `.env.example` into `.env`
2. run `pnpm i`
3. run `pnpm db:migrate`
4. run `pnpm dev`
5. open up `http://localhost:3000`

## Deployment

This repository has a [Github Workflow](.github/workflows/deploy.yml) set up to deploy automatically. \
If you want to deploy manually, refer to [Deploy a Fly App](https://fly.io/docs/apps/deploy/).

## Make it yours

### Infra

- [sign up on fiy.io](https://fly.io/docs/hands-on/)
- [setup deployment for fly.io](https://fly.io/docs/apps/launch/)
- set up [secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository) needed by [project's Github Workflows](./.github/workflows/).
  - [`FLY_API_TOKEN`](https://fly.io/docs/app-guides/continuous-deployment-with-github-actions/#api-tokens)

### Content

Here are some stuff you will need to adjust to make it your website.

#### Blog

- `/content/blog` \
  Written in mdx, every top-level file or directory with index file is a blog post.

#### Favicons

- `public/favicon.ico`
- `public/favicons`
- related fields in `public/site.webmanifest`

#### Logo

- logo in `app/components/navbar.tsx`

#### Pages' Meta

- `meta()` in every route

#### Social Links

- `LINKS` in `app/components/footer.tsx`
