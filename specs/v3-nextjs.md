# Claude Code Prompt — v3-nextjs

Run this from inside the `v3-nextjs` folder (the `create-next-app` App Router + TS scaffold already
exists). Read `../DESIGN.md` first for rationale; this is the build spec for **v3-nextjs** only.

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
3. Likes — a small **client component** (`'use client'`) with per-post count + global total, persisted
   to `localStorage`. This intentionally shows that interactivity still needs client JS even when the
   content is server-rendered. Keep search/sort optional; if included, they can be client components
   over the server-fetched list.
4. Navigation uses `next/link`.
5. **Styling (intentional):** build the UI from a real component library — **shadcn/ui** (preferred;
   Tailwind + Radix primitives) or **MUI** — so v3 looks like a polished, library-assembled modern
   app. This is the deliberate visual contrast with v1's hand-written CSS and v2's hand-styled
   components; it is part of the demo's "how we style things now" story, not just decoration.

## Constraints

- Lean on SSG, not SSR-per-request (content is known at build time; a blog is the canonical SSG case).
- Keep it idiomatic App Router (Server Components by default, `'use client'` only where state/`localStorage`
  is needed).
- Readable code; it will be shown and explained live.

## Acceptance check

- `pnpm install` then `pnpm dev` runs with no errors; default URL is http://localhost:3000.
- Index lists all 8 posts; clicking one loads a statically generated post page with the full body.
- **View-source on a post page shows the actual article HTML** (this is the core contrast vs v2).
- Each post page has a distinct `<title>` in the document head.
- `pnpm build` succeeds and reports the post routes as static.
