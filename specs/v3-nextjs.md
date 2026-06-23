# Claude Code Prompt — v3-nextjs

Run this from inside the `v3-nextjs` folder (the `create-next-app` App Router + TS scaffold already
exists). Read `../specs/Design.md` first for rationale; this is the build spec for **v3-nextjs** only.

---

Turn the existing Next.js (App Router) + TypeScript scaffold into the v3 blog: **statically
generated** at build time, content read from markdown files on the server. Replace the default
scaffold UI entirely. This version's whole job is to show server rendering and the SEO payoff.

## Source content

Copy the 8 markdown files from `../content` into this project (e.g. `content/`). Read them
**server-side** at build time. `gray-matter` IS appropriate here (this runs in Node, not the
browser). Render post bodies to HTML with **`marked`** on the server.

## Requirements (verifiable)

1. Index — `app/page.tsx` as a **Server Component** that reads `content/*.md` at build time and lists
   post cards (title, date, tags, excerpt, link to the post). Header with site title.
2. Post route — `app/posts/[slug]/page.tsx`
   - Implement `generateStaticParams` so every post is **statically generated** (SSG).
   - Read and render the post's markdown body to HTML server-side.
   - Implement `generateMetadata` to set a real per-post `<title>` and description — the concrete SEO
     win to point at in the talk.
3. Likes — **server-persisted**, to model how a real Next.js app reaches a backend:
   - Use **Prisma** with a **SQLite** datasource (local `dev.db` file). A `Like` model keyed by post
     `slug` with an integer `count`. Use a Prisma client singleton (avoid re-instantiating in dev).
   - A **Server Action** (`'use server'`) `likePost(slug)` upserts/increments and returns the new
     count, then calls `revalidatePath` so the per-post count and the header total stay in sync (the
     DB is the single source of truth — they cannot desync).
   - The like button + header total are small **client components** (`'use client'`) that invoke the
     server action. Counts reflect **all visitors** (shared, server-stored), not one browser — the
     real upgrade over v1/v2's `localStorage`.
   - Keep post **content** statically generated; only the like count is a dynamic, server-backed
     island. The SQLite file is **demo-only** — a deployed app would point Prisma at a hosted DB;
     that swap is a talking point, not something to build.
   - Keep search/sort optional; if included, they can be client components over the server-fetched
     list.
4. Navigation uses `next/link`.

## Constraints

- Lean on SSG for **content** (post bodies are known at build time; a blog is the canonical SSG
  case). Only the like count is dynamic — keep it a small server-backed island, do not turn whole
  pages dynamic to fetch it.
- Keep it idiomatic App Router (Server Components by default, `'use client'` only where interactivity
  is needed; mutations via a Server Action, not a hand-rolled API route).
- Add `prisma` + `@prisma/client`; the SQLite `dev.db` is created with `pnpm prisma migrate dev`.
  Run that (and `prisma generate`) before `pnpm dev`. Do **not** commit `dev.db`.
- Readable code; it will be shown and explained live.

## Acceptance check

- `pnpm install`, `pnpm prisma migrate dev`, then `pnpm dev` runs with no errors; default URL is
  http://localhost:3000.
- Index lists all 8 posts; clicking one loads a statically generated post page with the full body.
- **View-source on a post page shows the actual article HTML** (this is the core contrast vs v2).
- Each post page has a distinct `<title>` in the document head.
- `pnpm build` succeeds and reports the post routes as static.
- Liking a post persists via the Server Action to the SQLite DB; the new count and the header total
  both update, and the count **survives a server restart** (it is server-stored, not per-browser
  `localStorage`).
