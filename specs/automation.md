# Build Automation — Overnight Autonomous Build

This describes how the three demos (`v1-basic`, `v2-react`, `v3-nextjs`) are built **unattended,
concurrently, by Sonnet agents**, each working in PRs that **auto-merge when CI passes**. It is the
source of truth shared by (a) the builder agents and (b) the Playwright e2e suite that gates them.

Read alongside `Design.md` (rationale) and the per-version specs (`v1-basic.md`, `v2-react.md`,
`v3-nextjs.md`). Where this file and a per-version spec disagree on a **selector, route, or port**,
this file wins — those are the test contract.

## Model

- **Three builders run concurrently**, one per project, each in its **own git worktree** (they cannot
  share a working copy — concurrent `git` checkouts collide).
- **Within a project, features are built sequentially** — one feature → one PR → merge → next. This
  caps active agents at ~3, which is the main lever keeping token burn bounded.
- Each project's folder is disjoint, so concurrent merges to `main` never conflict.
- Builders use **Sonnet**. A **token budget** bounds the whole run; it stops when exhausted.

## Definition of done (per project)

Every test in that project's Playwright spec passes in CI, on `main`, after all feature PRs merge.
The tests below are the contract — "done" means green, not "looks right".

## Test contract (the linchpin)

The e2e suite is written **first** and does not change to accommodate an implementation. Builders
implement **to these selectors and routes** so the tests pass.

### Ports (each project's CI boots its own server)

| Project | Command under test | Port |
|---|---|---|
| v1-basic | static file server over `v1-basic/` | `4011` |
| v2-react | `pnpm build` then `pnpm preview --port 4012` | `4012` |
| v3-nextjs | `pnpm build` then `pnpm start -p 4013` | `4013` |

### Routes

- Index: `/` (v2, v3) or `index.html` (v1).
- Post: `/posts/:slug` (v2), `/posts/<slug>` (v3 → `/posts/<slug>`), `posts/<slug>.html` (v1).
- Slugs are the `slug` frontmatter values in `/content` (e.g. `baas-is-a-loan`).

### Required `data-testid`s (all three versions, identical)

Index / header / controls:
- `global-total` — header element showing the global like total (a number).
- `search-input` — the search text input.
- `sort-select` — the sort `<select>`. Option **values** must be exactly `newest`, `oldest`,
  `title`.
- `post-card` — one per post (exactly 8 on the index).
  - inside each card: `post-title`, `post-date`, `post-tags`, `post-excerpt`,
    `like-button`, `like-count` (a number), `read-link` (anchor to the post).

Post page:
- `post-title`, `post-body` (rendered markdown HTML), `back-link` (anchor to index).

### Behaviors asserted (per beat)

1. **Render** — index shows exactly 8 `post-card`s; each has non-empty title/excerpt and ≥1 tag.
2. **Search** — typing a substring unique to one title into `search-input` leaves exactly the
   matching card(s) visible.
3. **Sort** — selecting `oldest` orders cards by ascending date; `newest` descending; `title`
   alphabetical by title. (Assert the order of visible `post-title`s.)
4. **Like** — clicking the first card's `like-button` increments that card's `like-count` by 1 **and**
   `global-total` by 1.
5. **Persistence**
   - v1 / v2: after a like, reload the page in the **same** context → the elevated counts remain
     (localStorage).
   - v3: open a **second, fresh browser context** → it sees the **same** elevated count (proves the
     like is server-stored and shared, not per-browser). This is the test a localStorage impl fails.
6. **Navigation** — clicking a card's `read-link` lands on the post page; `post-title` matches and
   `post-body` is non-empty. `back-link` returns to the index.
7. **View-source (raw HTML, no JS — via Playwright `request.get`)**
   - v1 index raw HTML **contains** real post titles (static markup).
   - v2 index raw HTML has an **empty** root (`<div id="root">` with no post titles in it).
   - v3 post raw HTML **contains** the article body text (server-rendered).
8. **v3 metadata** — each post page's raw HTML `<title>` contains the post title.

## E2E harness layout

A single root `e2e/` package (keeps `v1-basic/` dependency-free, one Playwright/browser install):

```
e2e/
  package.json            # playwright only
  playwright.config.ts    # projects: v1, v2, v3 — each with its own baseURL + webServer
  tests/
    v1.spec.ts
    v2.spec.ts
    v3.spec.ts
  fixtures/posts.ts       # parsed expectations from /content (titles, slugs, dates) for assertions
```

`playwright.config.ts` defines three Playwright *projects*; each `webServer` block builds + boots the
relevant app on its port. CI runs only the spec for the changed project (see CI below).

## CI + auto-merge

- One workflow per project under `.github/workflows/`: `ci-v1.yml`, `ci-v2.yml`, `ci-v3.yml`.
- Each is **path-filtered** to its project folder (+ `e2e/`), so a builder's PR triggers only its own
  CI — concurrent PRs don't cross-trigger.
- Steps: checkout → setup node + pnpm → install (project + `e2e/`) → `playwright install --with-deps
  chromium` → build the app → run that project's spec (Playwright boots the server via `webServer`).
- **Branch protection** on `main` requires the matching check. Builders open PRs with
  `gh pr merge --auto --squash`, so a PR merges itself only when its check is green; a red PR stays
  open for morning review.
- Concurrency group per branch cancels superseded runs (saves CI minutes).

## Per-project feature checklist (the PR sequence)

Each builder works these **in order**, one PR each, each PR keeping CI green (earlier beats keep
passing as later ones land). Builder may merge a PR only after its own CI is green.

### v1-basic
1. `index.html` — header (`global-total`), controls (`search-input`, `sort-select`), 8 static
   `post-card`s generated from `/content` at author-time. Add the `data-testid`s.
2. `styles.css` — the deliberately-dated hand-written look (see `Design.md` Visual Design).
3. `script.js` — search filter, sort reorder (DOM nodes), likes (per-card + `global-total` +
   `localStorage`, restore on load).
4. `posts/<slug>.html` ×8 — full body, `back-link`, same CSS.

### v2-react
1. Strip scaffold; add `react-router`, `marked`, **Tailwind**.
2. Content loader (`import.meta.glob`, browser-safe frontmatter parse).
3. Routing (`/`, `/posts/:slug`), `Link` nav.
4. Index page + `PostCard` with all `data-testid`s; search + sort as derived state.
5. Likes via shared/lifted state (can't desync) + `localStorage`.
6. Post page (`useParams`, `marked` body).
7. Tailwind styling pass.

### v3-nextjs
1. Strip scaffold; add `prisma` + `@prisma/client`; SQLite schema (`Like` model: `slug`, `count`);
   `prisma migrate`.
2. Content read server-side (`gray-matter` + `marked`); index Server Component with `post-card`s.
3. Post route `app/posts/[slug]/page.tsx` + `generateStaticParams` + `generateMetadata`.
4. `likePost(slug)` **Server Action** (upsert/increment, `revalidatePath`); a `getLikes`/total read.
5. Like button + `global-total` as client components calling the action (shared across visitors).
6. shadcn/ui styling pass.

## Launch & kill switch

- Launch is a single background **Workflow** run: 3 worktree-isolated Sonnet builders, features
  sequential per project, bounded by a token budget.
- It is one job — stop it anytime; already-merged PRs stay merged.
- Morning review: open PRs (= things that failed CI) are the only manual work; everything merged is
  test-green.

## Risks (see Design.md too)

- **Green CI ≠ perfect UX.** Tests prove the beats; they don't prove polish. Isolation contains any
  bad merge to one folder.
- **Stalls** (failing test, loop) burn tokens; the budget cap and per-feature scope bound this.
- **CI flakiness** (browser install, rate limits) is the likeliest "why is it stuck"; CI has retries.
- **Local SQLite** in v3 is demo-only; CI tests the shared-count behavior in-process, not a deploy.
