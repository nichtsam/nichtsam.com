# GEMINI.md - nichtsam.com

## Project Overview
**nichtsam.com** is a personal website and blog built with **Astro**. Articles are written in **Markdown/MDX** and the site is styled using **Tailwind CSS v4**. Every page is static HTML with no client-side JavaScript.

### Key Technologies
- **Framework:** [Astro](https://astro.build/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) with `@tailwindcss/vite`
- **Content:** Astro content collections with `@astrojs/mdx`
- **Deployment:** [Cloudflare Workers static assets](https://developers.cloudflare.com/workers/static-assets/), every page prerendered at build time

---

## Project Structure
- `src/`: Core application code.
  - `pages/`: Routes; the file path is the URL.
  - `layouts/`: The page shell with the head meta, header and footer.
  - `components/`: Astro components.
  - `icons/`: SVG icons, imported as components.
  - `content.config.ts`: The articles collection and its frontmatter schema.
- `content/`: Markdown and MDX files for blog articles.
- `public/`: Static assets (favicons, OG image, manifest, `_headers`, `robots.txt`).

---

## Building and Running

### Development
1.  **Install Dependencies:** `pnpm install`
2.  **Start Dev Server:** `pnpm dev` (Runs `astro dev`).

### Quality
- **Typecheck:** `pnpm typecheck` (Runs `astro check`)
- **Format:** `pnpm format`
- **Full Validation:** `pnpm validate` (Formats, then typechecks).

### Production
- **Build:** `pnpm build` (Runs `astro build`, which prerenders every page into `dist`).
- **Start:** `pnpm start` (Serves the build with `wrangler dev`, as in production).

---

## Development Conventions

### Content Management
- Articles are stored in `content/articles/` as `.mdx` or `.md` files. Files starting with `_` are skipped.
- Each article requires frontmatter (title, description, publishedDate, keywords), validated by the schema in `src/content.config.ts`.
- Drafts (`draft: true`) are built and reachable by URL, but left out of listings and the sitemap.
- Custom MDX components are passed to `<Content />` in `src/pages/articles/[slug].astro`.

### Styling & UI
- **Tailwind CSS v4:** Configuration is integrated into Vite via `@tailwindcss/vite`; theme tokens live in `src/styles/theme.css`.
- **No client-side JavaScript:** Interactions use platform features instead, such as the popover API for the mobile menu.

### Deployment
- Deployed to **Cloudflare Workers** as static assets. Configuration in `wrangler.jsonc`, response headers (including the CSP) in `public/_headers`.
- There is no server at runtime.
- Continuous Deployment via GitHub Actions (`.github/workflows/deploy.yml`), from `main` only.
