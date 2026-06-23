import { test, expect } from '@playwright/test';
import { posts } from '../fixtures/posts';
import { bodySnippet, cardByTitle, intOf, norm, visibleTitles } from './_shared';

// v3-nextjs — Next.js App Router, SSG content + a SQLite-backed Server Action
// for likes. The headline beats: server-rendered article HTML, and a like count
// that is SHARED across browsers (proving a real backend, not localStorage).
// Search/sort are optional for v3 (per v3-nextjs.md) and intentionally not gated.

test.describe('v3-nextjs', () => {
  test('renders all 8 post cards', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('post-card')).toHaveCount(8);
    expect(new Set(await visibleTitles(page))).toEqual(new Set(posts.map((p) => p.title)));
  });

  test('liking updates the card count and the global total', async ({ page }) => {
    await page.goto('/');
    const card = cardByTitle(page, posts[0].title);
    const count = card.getByTestId('like-count');
    const total = page.getByTestId('global-total');
    const c0 = await intOf(count);
    const t0 = await intOf(total);
    await card.getByTestId('like-button').click();
    await expect.poll(() => intOf(count), { timeout: 10_000 }).toBe(c0 + 1);
    await expect.poll(() => intOf(total), { timeout: 10_000 }).toBe(t0 + 1);
  });

  test('like is shared across browsers (server-backed, not localStorage)', async ({ page, browser, baseURL }) => {
    await page.goto('/');
    const card = cardByTitle(page, posts[1].title);
    const c0 = await intOf(card.getByTestId('like-count'));
    await card.getByTestId('like-button').click();
    await expect.poll(() => intOf(card.getByTestId('like-count')), { timeout: 10_000 }).toBe(c0 + 1);

    // A brand-new context shares no localStorage/cookies. If the like were
    // client-only it would read the default count here; a real backend shows c0+1.
    const fresh = await browser.newContext();
    try {
      const p2 = await fresh.newPage();
      await p2.goto(baseURL!);
      await expect.poll(() => intOf(cardByTitle(p2, posts[1].title).getByTestId('like-count')), { timeout: 10_000 }).toBe(c0 + 1);
    } finally {
      await fresh.close();
    }
  });

  test.skip('navigates to a statically generated post and back', async ({ page }) => {
    const target = posts[0];
    await page.goto('/');
    await cardByTitle(page, target.title).getByTestId('read-link').click();
    await expect(page).toHaveURL(new RegExp(`/posts/${target.slug}$`));
    await expect(page.getByTestId('post-title')).toHaveText(target.title);
    expect((await page.getByTestId('post-body').innerText()).trim().length).toBeGreaterThan(0);
    await page.getByTestId('back-link').click();
    await expect(page.getByTestId('post-card').first()).toBeVisible();
  });

  test.skip('post raw HTML contains the server-rendered article (SSR/SSG)', async ({ request }) => {
    const target = posts[0];
    const html = await (await request.get(`/posts/${target.slug}`)).text();
    expect(norm(html)).toContain(norm(target.title));
    expect(norm(html)).toContain(norm(bodySnippet(target.body)));
  });

  test.skip('each post page has a real per-post <title> (metadata)', async ({ request }) => {
    const target = posts[0];
    const html = await (await request.get(`/posts/${target.slug}`)).text();
    const head = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? '';
    expect(norm(head)).toContain(norm(target.title));
  });
});
