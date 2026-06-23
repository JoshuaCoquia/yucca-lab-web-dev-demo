import { test, expect } from '@playwright/test';
import { posts, byOldest, byTitle, uniqueSearch } from '../fixtures/posts';
import { cardByTitle, intOf, norm, visibleTitles } from './_shared';

// v1-basic — vanilla static HTML/CSS/JS. Post pages are separate files.
// Every beat starts skipped; the builder un-skips ONLY the beat its feature
// delivers (see ../../specs/automation.md → Incremental gating).

test.describe('v1-basic', () => {
  test('renders all 8 post cards', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('post-card')).toHaveCount(8);
    expect(new Set(await visibleTitles(page))).toEqual(new Set(posts.map((p) => p.title)));
  });

  test.skip('search filters cards by title', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('search-input').fill(uniqueSearch.word);
    await expect(page.locator('[data-testid="post-card"]:visible')).toHaveCount(1);
    await expect(page.locator('[data-testid="post-card"]:visible')).toContainText(uniqueSearch.post.title);
  });

  test.skip('sort reorders the cards', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('sort-select').selectOption('oldest');
    expect(await visibleTitles(page)).toEqual(byOldest.map((p) => p.title));
    await page.getByTestId('sort-select').selectOption('title');
    expect(await visibleTitles(page)).toEqual(byTitle.map((p) => p.title));
  });

  test.skip('liking updates the card count and the global total', async ({ page }) => {
    await page.goto('/');
    const card = cardByTitle(page, posts[0].title);
    const count = card.getByTestId('like-count');
    const total = page.getByTestId('global-total');
    const c0 = await intOf(count);
    const t0 = await intOf(total);
    await card.getByTestId('like-button').click();
    await expect.poll(() => intOf(count)).toBe(c0 + 1);
    await expect.poll(() => intOf(total)).toBe(t0 + 1);
  });

  test.skip('likes persist across reload (localStorage)', async ({ page }) => {
    await page.goto('/');
    const card = cardByTitle(page, posts[0].title);
    const c0 = await intOf(card.getByTestId('like-count'));
    await card.getByTestId('like-button').click();
    await expect.poll(() => intOf(card.getByTestId('like-count'))).toBe(c0 + 1);
    await page.reload();
    await expect.poll(() => intOf(cardByTitle(page, posts[0].title).getByTestId('like-count'))).toBe(c0 + 1);
  });

  test.skip('navigates to a post page and back', async ({ page }) => {
    const target = posts[0];
    await page.goto('/');
    await cardByTitle(page, target.title).getByTestId('read-link').click();
    await expect(page.getByTestId('post-title')).toHaveText(target.title);
    expect((await page.getByTestId('post-body').innerText()).trim().length).toBeGreaterThan(0);
    await page.getByTestId('back-link').click();
    await expect(page.getByTestId('post-card').first()).toBeVisible();
  });

  test('index raw HTML contains real post titles (static markup)', async ({ request }) => {
    const html = await (await request.get('/')).text();
    for (const p of posts.slice(0, 3)) {
      expect(norm(html)).toContain(norm(p.title));
    }
  });
});
