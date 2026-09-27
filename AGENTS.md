# Agent guide

This is a Remix 3 app (`remix` package, v3 RC). Remix UI is **not React**:
components are `(handle) => () => JSX`, state lives in setup scope, and
`handle.update()` re-renders.

- Read `.agents/skills/remix/SKILL.md` and `node_modules/remix/INDEX.md` before
  using unfamiliar Remix APIs; the installed docs are canonical.
- `app/routes.ts` is the URL contract. Controllers live in `app/actions/`.
- Anything that runs in the browser must live in an `app/**/public/` directory,
  and its local imports must stay inside that directory.
- When an element has a `mix={css(...)}`, use `className`, not `class`, so the
  generated class is merged.
- Doodles are SVG components in `app/ui/public/doodles.tsx`; give hand-drawn
  lines the `boil` class for the wobble filter.

Before finishing: `pnpm format && pnpm typecheck && pnpm test`.
