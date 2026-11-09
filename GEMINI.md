# GEMINI.md - nichtsam.com

## Project Overview
**nichtsam.com** is a personal website and blog built with **React Router 7** (the successor to Remix). It features a content management system based on **MDX** for articles and is styled using **Tailwind CSS v4**.

### Key Technologies
- **Framework:** [React Router 7](https://reactrouter.com/) (using Vite)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) with `@tailwindcss/vite`
- **Content:** MDX via `content-collections`
- **Deployment:** [Cloudflare Workers static assets](https://developers.cloudflare.com/workers/static-assets/), every page prerendered at build time
- **Validation:** [Zod](https://zod.dev/) for schema validation (env, content)
- **Testing:** [Vitest](https://vitest.dev/) and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

---

## Project Structure
- `app/`: Core application code.
  - `components/`: Reusable UI components.
  - `routes/`: Route modules, mounted explicitly in `app/routes.ts`.
  - `utils/`: Server and client-side utilities (Content, etc.).
- `content/`: MDX files for blog articles.
- `other/`: Auxiliary files like SVG icons and `sly` configuration.
- `public/`: Static assets (favicons, OG image, manifest).
- `tests/`: Test setup and global test files.

---

## Building and Running

### Development
1.  **Environment:** Copy `.env.example` to `.env`.
2.  **Install Dependencies:** `pnpm install`
3.  **Start Dev Server:** `pnpm dev` (Runs `react-router dev`).

### Testing & Quality
- **Run Tests:** `pnpm test`
- **Typecheck:** `pnpm typecheck`
- **Lint:** `pnpm lint`
- **Format:** `pnpm format`
- **Full Validation:** `pnpm validate` (Auto-fixes lint and formatting, then runs typecheck and tests with coverage).

### Production
- **Build:** `pnpm build` (Runs `react-router build`, which prerenders every page into `build/client`).
- **Start:** `pnpm start` (Serves the build with `wrangler dev`, as in production).

---

## Development Conventions

### Routing
- Routes are declared explicitly in `app/routes.ts`; file names in `app/routes/` carry no meaning.

### Content Management
- Articles are stored in `content/articles/` as `.mdx` or `.md` files.
- Each article requires frontmatter (title, description, publishedDate, keywords) validated by Zod in `content-collections.ts`.
- Compiled articles are imported from `#content-collections`; custom MDX components live in `app/utils/content/mdx.tsx`.

### Styling & UI
- **Tailwind CSS v4:** Configuration is integrated into Vite via `@tailwindcss/vite`.
- **UI Components:** Found in `app/components/ui/`.
- **Icons:** SVG icons are managed via `vite-plugin-icons-spritesheet`. Source SVGs are in `other/svg-icons/`.

### Error Handling
- Use `app/components/error-boundary.tsx` for route-level error handling.
- Server-side errors should be handled gracefully, often using the `data()` utility from React Router.

### Deployment
- Deployed to **Cloudflare Workers** as static assets. Configuration in `wrangler.jsonc`, response headers in `public/_headers`.
- There is no server at runtime: route `headers` exports and loader response headers are never sent.
- Continuous Deployment via GitHub Actions (`.github/workflows/deploy.yml`), from `main` only.
