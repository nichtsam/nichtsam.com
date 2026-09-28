# Agent guide

This is a Remix 3 app (`remix` package, v3 RC). Remix UI is **not React**:
components are `(handle) => () => JSX`, state lives in setup scope, and
`handle.update()` re-renders.

- Read `docs/handoff.md` and `docs/spec.md` first: the handoff covers the
  current state and known pitfalls; the spec is the design, and changes to the
  design start there.
- Read `.agents/skills/remix/SKILL.md` and `node_modules/remix/INDEX.md` before
  using unfamiliar Remix APIs; the installed docs are canonical.
- `app/routes.ts` is the URL contract. Controllers live in `app/actions/`.
- Anything that runs in the browser must live in an `app/**/public/` directory,
  and its local imports must stay inside that directory.
- When an element has a `mix={css(...)}`, use `className`, not `class`, so the
  generated class is merged.
- Every page must work without JavaScript and with reduced motion. Motion is
  an enhancement: hidden "draw in" states only apply while `#js[data-on]` is
  set (see `app/ui/document.tsx` and `app/ui/public/site.css`).
- Pencil drawings come from `app/ui/public/pencil.ts` (seeded, shared by server
  and browser). Frames that fit their element are `<Sketch>`; fixed drawings
  are `<Doodle>` (`app/ui/public/doodles.ts`). Mark text or drawings to be
  drawn in with `data-ink`; `ink.tsx` does the rest.
- The theme comes from the `theme` cookie, read by `app/middleware/theme.ts`,
  so the server renders the right colors; `POST /theme` is the no-JS toggle.

Before finishing: `pnpm format && pnpm typecheck && pnpm test`.
