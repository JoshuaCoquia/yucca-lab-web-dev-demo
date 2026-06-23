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
  files, HTML arrives finished.

## Goals

- Demonstrate three distinct rendering/architecture paradigms with the *same* content so the only
  variable in the *architecture* comparison is the technology. (Visual styling deliberately differs
  per version — see **Visual Design** — but the measurable beats don't depend on looks.)
- Keep every version runnable by a peer who clones the repo cold.
- Make three contrasts visible and demoable (the "three beats"):
  1. **No tooling → tooling.** v1 opens in a browser; v2 needs `pnpm install` and a build step.
  2. **Manual DOM → component state.** A like counter that must keep a per-post count and a global
     total in sync — wired by hand in v1, automatic in v2.
  3. **Client rendering → server rendering (SEO).** View-source on v2 shows an empty root element;
     view-source on v3 shows real HTML. This is the SEO payoff and the reason meta-frameworks exist.

## Non-Goals

- Not a production blog. No CMS UI, no comments, no auth, no database.
- No cross-device sync. Likes persist per-browser via `localStorage`; "real sync needs a backend"
  is a talking point, not a feature.
- No exhaustive feature parity. Each version implements the shared core plus exactly what it needs
  to make its beat land.
- No monorepo tooling (no workspaces, no Turborepo). Each folder is independent on purpose.

## Shared Content

Eight markdown posts live in `/content` (frontmatter: `title`, `date`, `tags`, `excerpt`, `slug`).
Dates span 2024–2026 and tags span `frontend` / `backend` / `tooling` / `career` specifically so
that **sort** visibly reorders and **search/filter** has something to act on. All three versions
consume this same content; only the *consumption mechanism* differs.

## Visual Design

The **content and feature set are identical** across all three versions — that is the controlled
variable that keeps the rendering/architecture comparison honest. **Visual styling deliberately is
not.** Each version is styled the way something built on that stack, in that era, actually would be,
so the aesthetic becomes a quiet secondary narrative about how front-end styling itself evolved:

- **v1-basic** — hand-written CSS in the style of a site built *before* utility frameworks were
  everywhere. System fonts, a hand-rolled grid, a slightly dated but legible look. No framework, no
  build — the CSS is authored by hand the way it would have been then.
- **v2-react** — component-scoped styling written directly (plain CSS / CSS Modules), the clean,
  modern hand-styled look you get from just asking an assistant to style the components. Still no UI
  component library.
- **v3-nextjs** — assembled from a real UI component library (**shadcn/ui** preferred, or **MUI**),
  i.e. how a polished product app is built today.

This divergence does **not** confound the primary comparison: the measurable beats (manual DOM
wiring vs component state; empty root vs server-rendered HTML) are about behavior and markup, not
appearance. If anything the visual jump *reinforces* the progression — each version looks like its
own moment in time.

## Per-Version Design

### v1-basic — vanilla, no build

- `index.html` contains the post cards as **static HTML** (content is real in the markup — this is
  itself the contrast with v2's empty root). Header shows a global like total. Controls: search
  input + sort dropdown.
- `styles.css` styles the grid and cards.
- `scripts.js` *enhances* existing DOM: search filters cards, sort reorders nodes, like buttons
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
- Likes are a small client component (`'use client'` + `localStorage`). Teaching nuance:
  interactivity still needs client JS even when content is server-rendered.
- View-source shows the full article HTML. This is the beat the whole talk builds toward.

## Alternatives Considered

- **React Router Framework mode (rejected for v2).** It does SSR/file-routing — i.e. it *is* the v3
  step. Using it would erase the v2→v3 contrast. Declarative mode keeps v2 a pure client app.
- **`gray-matter` in v2 (rejected).** Node `Buffer` dependency breaks in a Vite browser bundle.
  Browser-safe frontmatter parsing avoids an hour of polyfill debugging. (`gray-matter` is fine in
  v3 because that runs on the server.)
- **Database for v3 (rejected).** A DB reads as "more full-stack" but is the wrong tool for a blog;
  git-based markdown files are idiomatic and match a real portfolio. Volume was never the point;
  *rendering location* is.
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
