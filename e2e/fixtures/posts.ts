import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Expected content derived from the real markdown in /content, so the assertions
// stay in sync with the source of truth instead of being hard-coded.

const CONTENT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'content');

export type Post = {
  slug: string;
  title: string;
  date: string; // ISO yyyy-mm-dd (string-sortable)
  tags: string[];
  excerpt: string;
  body: string; // raw markdown after the frontmatter block
};

// Minimal frontmatter parser for our known, simple format:
//   key: "value"   and   tags: ["a", "b"]
function parse(raw: string): { fm: Record<string, string | string[]>; body: string } {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { fm: {}, body: raw };
  const fm: Record<string, string | string[]> = {};
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    if (i === -1) continue;
    const key = line.slice(0, i).trim();
    const val = line.slice(i + 1).trim();
    if (val.startsWith('[') && val.endsWith(']')) {
      fm[key] = val
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean);
    } else {
      fm[key] = val.replace(/^["']|["']$/g, '');
    }
  }
  return { fm, body: m[2] ?? '' };
}

export const posts: Post[] = readdirSync(CONTENT_DIR)
  .filter((f) => f.endsWith('.md'))
  .map((f) => {
    const { fm, body } = parse(readFileSync(join(CONTENT_DIR, f), 'utf8'));
    return {
      slug: String(fm.slug),
      title: String(fm.title),
      date: String(fm.date),
      tags: Array.isArray(fm.tags) ? fm.tags : [],
      excerpt: String(fm.excerpt ?? ''),
      body: body.trim(),
    };
  });

export const byNewest = [...posts].sort((a, b) => b.date.localeCompare(a.date));
export const byOldest = [...posts].sort((a, b) => a.date.localeCompare(b.date));
export const byTitle = [...posts].sort((a, b) => a.title.localeCompare(b.title));

// A post whose title contains a word that appears in no other title — for the
// search beat (typing it should leave exactly one card).
export const uniqueSearch = (() => {
  for (const p of posts) {
    for (const word of p.title.split(/\W+/).filter((w) => w.length >= 5)) {
      const hits = posts.filter((q) => q.title.toLowerCase().includes(word.toLowerCase()));
      if (hits.length === 1) return { word, post: p };
    }
  }
  // Fallback: the whole first title (always unique).
  return { word: posts[0].title, post: posts[0] };
})();
