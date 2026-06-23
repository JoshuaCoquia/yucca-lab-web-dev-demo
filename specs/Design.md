# Design Doc — Web Dev Demo (YuCCA Lab)

This is a lightweight technical design document for a three-version teaching demo. It is the
source of truth for the build and the reference you present from. It deliberately keeps the
IEEE-830 *spirit* (clear scope, verifiable requirements, stated non-goals, alternatives with
reasoning) and drops the ceremony.

## Summary

One blog, built three times, each version more capable than the last. The progression is the
argument: each version's limitation is what motivates the next. The talk narrates *why* each
technology had to exist; the demo shows *what* it looks like.

- **v1-basic** — raw HTML/CSS/JS. No tooling. Open a file, it works.
- **v2-react** — Vite + React + TypeScript + React Router. A real client-side app. Everything
  renders in the browser.
- **v3-nextjs** — Next.js + TypeScript. Server-rendered / statically generated. Content lives in
  files, HTML arrives finished — and dynamic state (likes) is persisted in a real database via a
  server action. This is the full web app: the capstone of basic site → complex client app → app.

## Goals

- Demonstrate three distinct rendering/architecture paradigms with the *same* content so the only
  variable is the technology.
- Keep every version runnable by a peer who clones the repo cold.
- Make three contrasts visible and demoable (the "three beats"):
  1. **No tooling → tooling.** v1 opens in a browser; v2 needs `pnpm install` and a build step.
  2. **Manual DOM → component state.** A like counter that must keep a per-post count and a global
     total in sync — wired by hand in v1, automatic in v2.
  3. **Client rendering → server rendering (SEO).** This is a *round-trip*: view-source on v1
     already shows real HTML (SEO was free in the no-tooling version); v2 *sacrifices* it for
     interactivity (an empty root element); v3 *recovers* it with tooling (real HTML again). The
     payoff is getting v1's indexable HTML back without giving up v2's component model — the reason
     meta-frameworks exist.

## Non-Goals

- Not a production blog. No CMS UI, no comments, no auth. v3 *does* use a small database, but only
  to model how a real Next.js app reaches a backend — it is not production-hardened (no auth, no
  abuse protection, a local SQLite file).
- Like persistence differs by version on purpose. v1 and v2 persist likes per-browser via
  `localStorage` (no cross-device sync — "real sync needs a backend" is the talking point). v3 then
  *delivers* that backend: likes are stored server-side and shared across all visitors. That jump is
  a feature of the progression, not an accident.
- No exhaustive feature parity. Each version implements the shared core plus exactly what it needs
  to make its beat land.
- No monorepo tooling (no workspaces, no Turborepo). Each folder is independent on purpose.

## Shared Content

Eight markdown posts live in `/content` (frontmatter: `title`, `date`, `tags`, `excerpt`, `slug`).
Dates span 2024–2026 and tags span `frontend` / `backend` / `tooling` / `career` specifically so
that **sort** visibly reorders and **search/filter** has something to act on. All three versions
consume this same content; only the *consumption mechanism* differs.

## Per-Version Design

### v1-basic — vanilla, no build

- `index.html` contains the post cards as **static HTML** (content is real in the markup — this is
  itself the contrast with v2's empty root, and the starting point of the SEO round-trip in beat 3:
  the no-tooling version already ships indexable HTML). Header shows a global like total. Controls:
  search input + sort dropdown.
- `styles.css` styles the grid and cards.
- `script.js` *enhances* existing DOM: search filters cards, sort reorders nodes, like buttons
  update a per-card count, the global total, and `localStorage`. The point: every update is wired by
  hand, and keeping the per-card counts and the global total in sync is manual.
- Full posts are **separate static HTML pages** (`posts/<slug>.html`). Navigation is a full page
  reload. No shared layout — each page repeats the chrome.

### v2-react — Vite + React + TS + React Router (declarative mode)

- Posts loaded from markdown via Vite's `import.meta.glob`; frontmatter parsed with a small
  browser-safe parser; body rendered with `marked`. **Do not use `gray-matter`** — it depends on
  Node's `Buffer` and breaks in the browser.
- Routing: `react-router` declarative mode only — `BrowserRouter`, `Routes`, `Route`, `Link`,
  `useParams`. Routes: `/` (index) and `/posts/:slug` (post). **Do not use Framework mode** — it is
  a Next.js-class meta-framework and would collapse the v2/v3 distinction.
- Index: search + sort are **derived state** from one posts array. Like counter uses React state
  lifted/shared so the per-post count and the global total **cannot desync** — this is the v1→v2
  payoff. Persist to `localStorage`.
- Client-side rendering: view-source shows an empty `<div id="root">`. This is the setup for v3.

### v3-nextjs — Next.js (App Router) + TS, SSG

- Posts read from `content/*.md` **server-side** at build time. `gray-matter` is fine here (Node is
  available). Body rendered to HTML with `marked`.
- File-based routing: `app/page.tsx` (index), `app/posts/[slug]/page.tsx` with
  `generateStaticParams` → static generation.
- Per-post `generateMetadata` for real `<title>`/description — the concrete SEO win.
- Likes are **server-persisted**: a Prisma-managed **SQLite** database (local file) with one `Like`
  row per post, mutated by a `likePost(slug)` **Server Action**. A small `'use client'` like button
  calls the action; the count reflects *all visitors*, not one browser — the real upgrade over
  v1/v2's `localStorage`. The DB is the single source of truth, so the per-post count and the header
  total can't desync; after a like, `revalidatePath` refreshes both. (Local SQLite is demo-only — a
  deployed app would point Prisma at a hosted DB; that swap is the talking point, not something we
  build.)
- The article content is still **statically generated** (the SEO beat is intact); only the like
  count is a dynamic, server-backed island. Teaching nuance: one page can ship finished HTML *and*
  carry real server-mutated state — static content, dynamic data, same page.
- View-source shows the full article HTML. This is the beat the whole talk builds toward — and v3 is
  now a real full-stack app: server-rendered content plus a real backend behind the likes.

## Alternatives Considered

- **React Router Framework mode (rejected for v2).** It does SSR/file-routing — i.e. it *is* the v3
  step. Using it would erase the v2→v3 contrast. Declarative mode keeps v2 a pure client app.
- **`gray-matter` in v2 (rejected).** Node `Buffer` dependency breaks in a Vite browser bundle.
  Browser-safe frontmatter parsing avoids an hour of polyfill debugging. (`gray-matter` is fine in
  v3 because that runs on the server.)
- **Database for v3 *content* (rejected) — but a DB for *dynamic state* (accepted).** Post content
  stays git-based markdown: idiomatic for a blog, matches a real portfolio, and keeps content
  identical across all three versions. *Dynamic* state (likes), though, is exactly what a database is
  for — and v3's role in the progression is to be a real web app — so it persists likes via Prisma +
  SQLite and a server action. The DB models the full-stack pattern; it does not store the posts.
- **REST Route Handler for likes (rejected in favor of a Server Action).** An `app/api/...` endpoint
  works, but a `'use server'` action is the idiomatic App Router way to mutate and keeps the demo
  closer to how a modern Next.js codebase is actually written.
- **Separate HTML/CSS/JS stages in v1 (rejected).** Splitting the no-tooling version into three sub-
  versions burned demo time on a contrast not worth showing at 10–15 minutes.
- **Showing `pnpm install` live (rejected).** The beat is the conceptual jump (file → toolchain),
  not watching an install spinner. Run installs beforehand.

## Risks / Open Questions

- **Live-demo stale state.** Hard-refresh every tab right before presenting; dev servers left idle
  can drift via HMR.
- **`marked` API.** Confirm the rendered-HTML call signature when the prompt runs; it is stable but
  version-check.
- **Tab choreography.** Pre-arrange the exact tabs (v1 index, a v1 post, v2 index + view-source, v3
  index + view-source). Fumbling between windows is what makes a live demo read as unpolished.
- **Time ceiling.** Self-imposed 15:00 max. A demo-led talk runs long more easily than a slide talk;
  rehearse against a timer.
