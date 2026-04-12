# GEMINI.md - nichtsam.com

## Project Overview
**nichtsam.com** is a personal website and blog built with **React Router 7** (the successor to Remix). It features a content management system based on **MDX** for articles, a **Drizzle ORM** (SQLite/LibSQL) backend for user sessions and connections, and is styled using **Tailwind CSS v4**.

### Key Technologies
- **Framework:** [React Router 7](https://reactrouter.com/) (using Vite)
- **Database:** [Drizzle ORM](https://orm.drizzle.team/) with [LibSQL](https://turso.tech/libsql) (SQLite)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) with `@tailwindcss/vite`
- **Content:** MDX via `mdx-bundler` and `gray-matter`
- **Deployment:** [Fly.io](https://fly.io/)
- **Validation:** [Zod](https://zod.dev/) for schema validation (forms, env, content)
- **Authentication:** `remix-auth` with GitHub strategy
- **Testing:** [Vitest](https://vitest.dev/) and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

---

## Project Structure
- `app/`: Core application code.
  - `components/`: Reusable UI components (including Radix UI primitives in `ui/`).
  - `routes/`: Application routes (using `remix-flat-routes` convention).
  - `utils/`: Server and client-side utilities (DB, Auth, Content, Theme, etc.).
- `content/`: MDX files for blog articles.
- `drizzle/`: Database schema, migrations, and migration scripts.
- `other/`: Auxiliary files like SVG icons and `sly` configuration.
- `public/`: Static assets (favicons, images, manifest).
- `tests/`: Test setup and global test files.

---

## Building and Running

### Development
1.  **Environment:** Copy `.env.example` to `.env`.
2.  **Install Dependencies:** `pnpm install`
3.  **Database Migration:** `pnpm db:migrate` (Runs `drizzle/migrate.ts` via `tsx`).
4.  **Start Dev Server:** `pnpm dev` (Runs `node ./server.js`).

### Testing & Quality
- **Run Tests:** `pnpm test`
- **Typecheck:** `pnpm typecheck`
- **Lint:** `pnpm lint`
- **Format:** `pnpm format`
- **Full Validation:** `pnpm validate` (Runs lint, format, typecheck, and tests).

### Production
- **Build:** `pnpm build` (Runs `react-router build`).
- **Start:** `pnpm start` (Runs the production server via `server.js`).

---

## Development Conventions

### Routing
- The project uses **flat routes** via `remix-flat-routes`. Routes are located in `app/routes/`.
- Convention: Files like `_site+/_index.tsx` or `_site+.articles.tsx` define the URL structure.

### Database & Models
- **Schema:** Defined in `drizzle/schema.ts`.
- **Migrations:** Managed via `drizzle-kit`. Use `pnpm db:migrate` to apply.
- **Access:** Use `#app/utils/db.server.ts` to interact with the database.

### Content Management
- Articles are stored in `content/articles/` as `.mdx` or `.md` files.
- Each article requires frontmatter (title, date, etc.) validated by Zod in `app/utils/content/model.ts`.
- MDX is processed using `app/utils/content/retrieve.ts`.

### Styling & UI
- **Tailwind CSS v4:** Configuration is integrated into Vite via `@tailwindcss/vite`.
- **UI Components:** Found in `app/components/ui/`, mostly based on Radix UI.
- **Icons:** SVG icons are managed via `vite-plugin-icons-spritesheet`. Source SVGs are in `other/svg-icons/`.

### Error Handling
- Use `app/components/error-boundary.tsx` for route-level error handling.
- Server-side errors should be handled gracefully, often using the `data()` utility from React Router.

### Deployment
- Deployed to **Fly.io**. Configuration in `fly.toml`.
- Continuous Deployment via GitHub Actions (`.github/workflows/deploy.yml`).
