export const meta = {
  name: 'build-demos',
  description: 'Build all three blog demos to passing e2e tests, auto-merging feature PRs as CI goes green',
  whenToUse: 'Overnight autonomous build of v1-basic, v2-react, and v3-nextjs per specs/automation.md',
  phases: [
    { title: 'Gate', detail: 'e2e harness + CI workflows', model: 'sonnet' },
    { title: 'v1-basic', model: 'sonnet' },
    { title: 'v2-react', model: 'sonnet' },
    { title: 'v3-nextjs', model: 'sonnet' },
    { title: 'Verify', model: 'sonnet' },
  ],
}

// Shared instructions appended to every builder prompt.
const READ = 'Before writing any code, read specs/Design.md, the per-version spec, and specs/automation.md (the test contract — its data-testids, routes, ports, and per-beat behaviors are binding).'

const MERGE = [
  'When the feature is implemented:',
  '1. In the project e2e spec, REMOVE `.skip` from ONLY the beat(s) this feature delivers; leave beats for unbuilt features skipped.',
  '2. Optionally run a quick local build/typecheck to catch obvious errors (do NOT rely on local test runs as the gate).',
  '3. Create a feature branch, commit, push, and open a PR with `gh pr create`.',
  "4. Wait for this PR's CI with `gh run watch` (or `gh pr checks <branch> --watch`).",
  '5. ONLY when every check is green, merge with `gh pr merge --squash --delete-branch`.',
  '6. If CI is red: read `gh run view --log-failed`, fix, push, and re-watch — up to 4 attempts total.',
  '7. If still red after 4 attempts, LEAVE THE PR OPEN and return a short note naming the failing test. NEVER merge a red PR.',
].join('\n')

const SPEC_FILE = { 'v1-basic': 'specs/v1-basic.md', 'v2-react': 'specs/v2-react.md', 'v3-nextjs': 'specs/v3-nextjs.md' }
const SPEC_NAME = { 'v1-basic': 'v1', 'v2-react': 'v2', 'v3-nextjs': 'v3' }

// Build one project: features run in dependency order; each is its own PR that self-merges on green.
async function buildProject(project, features) {
  const results = []
  for (let i = 0; i < features.length; i++) {
    const r = await agent(
      [
        `You are building the **${project}** demo for the YuCCA "one blog, built three ways" talk.`,
        READ.replace('the per-version spec', SPEC_FILE[project]),
        ``,
        `Implement THIS feature only (feature ${i + 1} of ${features.length} for ${project}):`,
        `  ${features[i]}`,
        ``,
        `Build it to the data-testid / route / port contract in specs/automation.md so the matching beat(s) in e2e/tests/${SPEC_NAME[project]}.spec.ts pass. Keep all previously-delivered beats passing.`,
        ``,
        MERGE,
        ``,
        `Return a one-line status: feature name + merged|open(+failing test).`,
      ].join('\n'),
      { phase: project, label: `${project}:${i + 1}`, model: 'sonnet', isolation: 'worktree' }
    )
    results.push(r)
  }
  return { project, results }
}

log('Starting overnight build of all three demos. Gate first, then v1/v2/v3 concurrently.')

// ── Gate phase: build the e2e harness + CI that everything else is gated by ──
phase('Gate')
const gate = await agent(
  [
    'Set up the end-to-end test GATE for all three demos, exactly as specified in specs/automation.md (sections "Test contract", "Incremental gating (skip strategy)", "E2E harness layout", and "CI + auto-merge"). Read that file carefully first.',
    '',
    'Create the root `e2e/` Playwright package:',
    '- `e2e/package.json` (Playwright only), `e2e/playwright.config.ts` with three Playwright projects (v1/v2/v3) on ports 4011/4012/4013, each with its own `baseURL` and a `webServer` that builds + boots that app (v1: a static file server over ../v1-basic; v2: `pnpm -C ../v2-react build` then `preview --port 4012`; v3: prisma migrate + `pnpm -C ../v3-nextjs build` then `start -p 4013`).',
    '- `e2e/fixtures/posts.ts` deriving expected titles/slugs/dates from ../content.',
    '- `e2e/tests/v1.spec.ts`, `v2.spec.ts`, `v3.spec.ts` covering EVERY beat in the contract (render, search, sort, like, persistence — including v3 second-context shared-count — navigation, view-source raw-HTML assertions, v3 metadata).',
    '',
    'CRITICAL: mark EVERY beat `test.skip` initially (the apps do not exist yet). Builders un-skip beats as they deliver them.',
    '',
    'Create three path-filtered GitHub Actions workflows `.github/workflows/ci-v1.yml`, `ci-v2.yml`, `ci-v3.yml`: each triggers on PRs touching its project folder or `e2e/`, installs (project + e2e), runs `playwright install --with-deps chromium`, builds the app, and runs ONLY that project\'s spec. Give each a stable check/job name. Add a per-branch concurrency group.',
    '',
    'Verify `pnpm -C e2e install` and `pnpm -C e2e exec playwright test --list` succeed. Then commit DIRECTLY to `main` (this is shared infra, not a gated feature) and push. Return a one-line status.',
  ].join('\n'),
  { phase: 'Gate', model: 'sonnet', isolation: 'worktree' }
)

// ── Build phases: three projects concurrently, features sequential within each ──
const built = await parallel([
  () => buildProject('v1-basic', [
    'index.html: header with `global-total`, controls (`search-input`, and `sort-select` whose option VALUES are exactly newest/oldest/title), and 8 static `post-card`s generated from /content at author-time, each with post-title/post-date/post-tags/post-excerpt/like-button/like-count/read-link testids.',
    'styles.css: the deliberately-dated, hand-written pre-utility-framework look (system fonts, hand-rolled grid) per Design.md Visual Design.',
    'script.js: search filters cards by title, sort reorders the DOM nodes, likes increment a per-card `like-count` + the `global-total` and persist to localStorage (restore on load). Manual DOM wiring, no data-array rebuild.',
    'posts/<slug>.html for all 8 posts: full rendered body with post-title/post-body, a `back-link` to the index, same CSS.',
  ]),
  () => buildProject('v2-react', [
    'Strip the Vite scaffold; add react-router + marked + Tailwind CSS; app shell + routing for `/` and `/posts/:slug` using <Link> (no full reload).',
    'Content loader: import.meta.glob (eager, raw) over copied markdown + a browser-safe frontmatter parser; a `Post` type. Do NOT use gray-matter.',
    'Index page + PostCard with every testid; search + sort implemented as derived state from one posts array (sort values newest/oldest/title).',
    'Likes: per-post count and `global-total` share one lifted/shared state so they cannot desync; persist to localStorage, restore on load.',
    'Post page: useParams reads :slug, renders markdown body via marked into post-body, post-title + back-link; then a Tailwind styling pass across the whole app (no component library).',
  ]),
  () => buildProject('v3-nextjs', [
    'Strip the Next scaffold; add prisma + @prisma/client; SQLite datasource with a `Like` model (slug unique + integer count); a Prisma client singleton; run prisma migrate so dev.db exists. Do not commit dev.db.',
    'Server-side content: read ../content with gray-matter + render with marked; index `app/page.tsx` Server Component listing post-cards with every testid.',
    'Post route app/posts/[slug]/page.tsx with generateStaticParams (SSG) and generateMetadata (real per-post <title> + description); render body server-side into post-body.',
    'likePost(slug) Server Action: upsert/increment the Like row, then revalidatePath; plus a total read summing counts.',
    'like-button + `global-total` as `use client` components that call the Server Action (counts shared across all visitors, not localStorage); then a shadcn/ui styling pass across the app.',
  ]),
])

// ── Verify phase ──
phase('Verify')
const verdict = await agent(
  [
    'Verify the finished build on the latest `main`.',
    'For each of v1-basic, v2-react, v3-nextjs: confirm its e2e spec (e2e/tests/{v1,v2,v3}.spec.ts) has NO remaining `test.skip`, and report whether the latest CI run on `main` is green.',
    'List any project that still has OPEN (unmerged) PRs or skipped/failing beats — those need morning attention.',
    'Return a concise status report grouped by project.',
  ].join('\n'),
  { phase: 'Verify', model: 'sonnet' }
)

return { gate, built, verdict }
