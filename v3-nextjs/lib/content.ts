import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const CONTENT_DIR = path.join(process.cwd(), '..', 'content');

export type Post = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
  body: string; // raw markdown after frontmatter
};

export function getAllPosts(): Post[] {
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.md'));
  return files.map((file) => {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf8');
    const { data, content } = matter(raw);
    return {
      slug: String(data.slug),
      title: String(data.title),
      date: String(data.date),
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      excerpt: String(data.excerpt ?? ''),
      body: content.trim(),
    };
  });
}

export function getPostBySlug(slug: string): Post | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}
