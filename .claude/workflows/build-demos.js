export const meta = {
  name: 'build-demos',
  description: 'Build all three blog demos to passing e2e tests, auto-merging feature PRs as CI goes green',
  whenToUse: 'Overnight autonomous build of v1-basic, v2-react, and v3-nextjs per specs/automation.md',
  phases: [
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

log('Starting overnight build. The e2e gate + CI are already in the repo; building v1/v2/v3 concurrently.')

// The gate (e2e/ harness + .github/workflows/ci-v{1,2,3}.yml) is pre-built and on `main`.
// Each builder implements to it and un-skips the beats it delivers — it does NOT touch the gate.

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

return { built, verdict }
