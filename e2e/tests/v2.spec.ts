import { test, expect } from '@playwright/test';
import { posts, byOldest, byTitle, uniqueSearch } from '../fixtures/posts';
import { cardByTitle, intOf, norm, visibleTitles } from './_shared';

// v2-react — Vite + React SPA, client-side rendered + client routing.
// Same contract as v1, plus the "empty root in raw HTML" beat.

test.describe('v2-react', () => {
  test('renders all 8 post cards', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('post-card')).toHaveCount(8);
    expect(new Set(await visibleTitles(page))).toEqual(new Set(posts.map((p) => p.title)));
  });

  test('search filters cards by title (derived state)', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('search-input').fill(uniqueSearch.word);
    await expect(page.getByTestId('post-card')).toHaveCount(1);
    await expect(page.getByTestId('post-card')).toContainText(uniqueSearch.post.title);
  });

  test('sort reorders the cards', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('sort-select').selectOption('oldest');
    expect(await visibleTitles(page)).toEqual(byOldest.map((p) => p.title));
    await page.getByTestId('sort-select').selectOption('title');
    expect(await visibleTitles(page)).toEqual(byTitle.map((p) => p.title));
  });

  test('liking updates the card count and the global total (cannot desync)', async ({ page }) => {
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

  test('likes persist across reload (localStorage)', async ({ page }) => {
    await page.goto('/');
    const card = cardByTitle(page, posts[0].title);
    const c0 = await intOf(card.getByTestId('like-count'));
    await card.getByTestId('like-button').click();
    await expect.poll(() => intOf(card.getByTestId('like-count'))).toBe(c0 + 1);
    await page.reload();
    await expect.poll(() => intOf(cardByTitle(page, posts[0].title).getByTestId('like-count'))).toBe(c0 + 1);
  });

  test('navigates to a post (client-side) and back', async ({ page }) => {
    const target = posts[0];
    await page.goto('/');
    await cardByTitle(page, target.title).getByTestId('read-link').click();
    await expect(page).toHaveURL(new RegExp(`/posts/${target.slug}$`));
    await expect(page.getByTestId('post-title')).toHaveText(target.title);
    expect((await page.getByTestId('post-body').innerText()).trim().length).toBeGreaterThan(0);
    await page.getByTestId('back-link').click();
    await expect(page.getByTestId('post-card').first()).toBeVisible();
  });

  test('index raw HTML has an empty root (client-rendered)', async ({ request }) => {
    const html = await (await request.get('/')).text();
    for (const p of posts) {
      expect(norm(html)).not.toContain(norm(p.title));
    }
  });
});
