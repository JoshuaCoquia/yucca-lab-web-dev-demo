import type { Post } from '../types';

// Browser-safe frontmatter parser. Reads the --- block, no Node deps.
function parseFrontmatter(raw: string): { fm: Record<string, string | string[]>; body: string } {
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

// Eagerly load all markdown files from src/content via Vite's import.meta.glob.
const rawFiles = import.meta.glob('./**.md', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>;

export const posts: Post[] = Object.values(rawFiles).map((raw) => {
  const { fm, body } = parseFrontmatter(raw);
  return {
    slug: String(fm.slug ?? ''),
    title: String(fm.title ?? ''),
    date: String(fm.date ?? ''),
    tags: Array.isArray(fm.tags) ? fm.tags : [],
    excerpt: String(fm.excerpt ?? ''),
    body: body.trim(),
  };
});
