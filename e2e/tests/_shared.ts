import { type Locator, type Page } from '@playwright/test';

// Parse the integer out of a like-count / global-total element, tolerant of
// surrounding glyphs (e.g. "♥ 3").
export async function intOf(loc: Locator): Promise<number> {
  const text = (await loc.innerText()).trim();
  const m = text.match(/-?\d+/);
  return m ? parseInt(m[0], 10) : NaN;
}

// A post-card located by its exact title — robust to re-ordering (sort) and
// to the list being re-rendered (React) or reloaded.
export function cardByTitle(page: Page, title: string): Locator {
  return page.getByTestId('post-card').filter({ has: page.getByText(title, { exact: true }) });
}

// Order of the visible card titles, top to bottom.
export async function visibleTitles(page: Page): Promise<string[]> {
  const texts = await page.getByTestId('post-title').allInnerTexts();
  return texts.map((t) => t.trim());
}

export const norm = (s: string): string => s.toLowerCase().replace(/\s+/g, ' ').trim();

// A short plain-text slice of a markdown body, for asserting server-rendered
// article text appears in raw HTML.
export function bodySnippet(body: string): string {
  const line =
    body
      .split('\n')
      .map((l) => l.trim())
      .find((l) => l && !l.startsWith('#') && !l.startsWith('!') && !l.startsWith('>')) ?? '';
  return line.replace(/[*_`>#[\]()!]/g, '').trim().slice(0, 30);
}
