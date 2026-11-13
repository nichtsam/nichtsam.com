# nichtsam.com

Personal site and blog. Astro prerenders every page into `dist`, and Cloudflare
Workers serves it as static assets, with no server at runtime.

- Build interactions from platform features, like `<details>` for the project
  stories, so pages stay script-free.
- The CSP in `public/_headers` allows only same-origin resources, so an inline
  script or anything from another origin needs it widened.
- Pushing to `main` deploys production through Cloudflare Workers Builds, which
  is set up in the Cloudflare dashboard, not in this repo.
- Check work with `pnpm validate`, which formats and then type checks.
