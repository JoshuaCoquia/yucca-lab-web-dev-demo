# Claude Code Prompt — v2-react

Run this from inside the `v2-react` folder (the Vite + React + TS scaffold already exists). Read
`../specs/Design.md` first for rationale; this is the build spec for **v2-react** only.

---

Turn the existing Vite + React + TypeScript scaffold into the v2 blog: a **client-side rendered**
single-page app with client-side routing and markdown-driven content. Replace the default scaffold
UI entirely.

## Source content

Copy the 8 markdown files from `../content` into this project (e.g. `src/content/`). Load them with
Vite's `import.meta.glob` (eager, as raw strings). Parse frontmatter with a **small browser-safe
parser** (a short regex/split over the `---` block is fine). Render post bodies with **`marked`**.

> Do NOT use `gray-matter` — it depends on Node's `Buffer` and breaks in a browser bundle. Add
> `react-router` and `marked` as runtime dependencies, plus **Tailwind CSS** (dev dependency) for
> styling — see requirement 6.

## Requirements (verifiable)

1. Routing — `react-router` **declarative mode only**: `BrowserRouter`, `Routes`, `Route`, `Link`,
   `useParams`.
   - `/` → index page.
   - `/posts/:slug` → single post page.
   - Use `<Link>` for navigation (no full reload). Do NOT use React Router framework/data mode.
2. Index page
   - Header with site title and a **global like total**.
   - **Search** (filter by title) and **sort** (Newest / Oldest / Title A–Z) implemented as
     **derived state** from a single posts array — not by mutating the DOM.
   - A grid of post cards (title, date, tags, excerpt, like button + count, link to the post).
3. Like counter — the v1→v2 payoff
   - Per-post counts and the header global total share one source of state (lifted state or a small
     context) so they **cannot desync**. Persist to `localStorage`; restore on load.
4. Post page
   - `useParams()` reads `:slug`, finds the post, renders its markdown body via `marked`.
   - A `<Link>` back to the index.
5. Componentize sensibly: a `PostCard`, a header/layout, an index page, a post page. Keep types
   simple (`string`, `number`, a `Post` interface).
6. **Styling (intentional):** use **Tailwind CSS** (utility-first) — the dominant styling approach
   for modern React apps. Add Tailwind to the Vite project and style components with utility classes.
   **Do not add a UI component library** (no MUI, no shadcn) — prebuilt components are reserved for
   v3, so the three versions read as distinct styling eras: hand-written CSS → utility classes →
   component library.

## Constraints

- This is a pure client-side app. Do not add SSR. View-source should show a near-empty
  `<div id="root">` — that contrast is intentional and is referenced in the talk.
- Keep components readable; they will be shown and explained live.

## Acceptance check

- `pnpm install` then `pnpm dev` runs with no errors; default URL is http://localhost:5173.
- Index shows 8 posts; search filters, sort reorders, both via state.
- Liking a card updates its count and the header total together, surviving a refresh.
- Clicking a post navigates client-side (no reload) to a page rendering the full markdown body.
- View-source on the running app shows an empty root element (content is injected by JS).
