import type { Post } from '../types'

// Eagerly load all markdown files as raw strings.
const modules = import.meta.glob('./*.md', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>

/**
 * Parse YAML-like frontmatter from a markdown string using a browser-safe
 * regex/split approach. No gray-matter — it depends on Node's Buffer.
 */
function parseFrontmatter(raw: string): { data: Record<string, unknown>; content: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!match) return { data: {}, content: raw }

  const [, yaml, content] = match
  const data: Record<string, unknown> = {}

  for (const line of yaml.split('\n')) {
    const colon = line.indexOf(':')
    if (colon === -1) continue
    const key = line.slice(0, colon).trim()
    const value = line.slice(colon + 1).trim()

    // Arrays: ["a", "b"] or [a, b]
    if (value.startsWith('[')) {
      data[key] = value
        .slice(1, -1)
        .split(',')
        .map((v) => v.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean)
    } else {
      // Strip surrounding quotes from strings
      data[key] = value.replace(/^["']|["']$/g, '')
    }
  }

  return { data, content }
}

/**
 * All 8 posts, parsed and ready. Exported as a plain array — no dynamic
 * imports, no async, because import.meta.glob with eager:true is synchronous.
 */
export const posts: Post[] = Object.entries(modules).map(([, raw]) => {
  const { data, content } = parseFrontmatter(raw)

  return {
    slug: String(data.slug ?? ''),
    title: String(data.title ?? ''),
    date: String(data.date ?? ''),
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
    excerpt: String(data.excerpt ?? ''),
    body: content.trim(),
  }
})
