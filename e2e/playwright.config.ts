import { defineConfig } from '@playwright/test';

// One config, three demos. Each demo is a Playwright "project" bound to its own
// port + webServer. CI sets E2E_TARGET=v1|v2|v3 so only that demo's server boots
// and only its spec runs; with E2E_TARGET unset, all three run locally.
//
// Ports and routes are the test contract — see ../specs/automation.md.

type Target = 'v1' | 'v2' | 'v3';

const SERVERS: Record<Target, { port: number; command: string }> = {
  // v1 is static files — serve the folder, no build. python3 is present on CI + dev.
  v1: { port: 4011, command: 'python3 -m http.server 4011 -d ../v1-basic' },
  // v2 is a Vite SPA — build then preview the production bundle.
  v2: { port: 4012, command: 'pnpm -C ../v2-react build && pnpm -C ../v2-react preview --port 4012 --strictPort' },
  // v3 is Next.js SSG + a SQLite-backed Server Action. Apply migrations if a schema
  // exists (it won't until the v3 builder adds Prisma), then build + start.
  v3: {
    port: 4013,
    command:
      '(test -f ../v3-nextjs/prisma/schema.prisma && pnpm -C ../v3-nextjs exec prisma migrate deploy || true) && pnpm -C ../v3-nextjs build && pnpm -C ../v3-nextjs start -p 4013',
  },
};

const TARGET = process.env.E2E_TARGET as Target | undefined;
const targets: Target[] = TARGET ? [TARGET] : ['v1', 'v2', 'v3'];

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  timeout: 30_000,
  expect: { timeout: 7_000 },
  projects: targets.map((t) => ({
    name: t,
    testMatch: `**/${t}.spec.ts`,
    use: { baseURL: `http://localhost:${SERVERS[t].port}` },
  })),
  webServer: targets.map((t) => ({
    command: SERVERS[t].command,
    url: `http://localhost:${SERVERS[t].port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: 'pipe',
    stderr: 'pipe',
  })),
});
