// Server-side DB read helpers (not Server Actions — no 'use server' directive needed
// because these are only ever called from Server Components, never from the client).

import prisma from './prisma';

/**
 * Get the sum of all like counts (for the header global-total).
 */
export async function getLikesTotal(): Promise<number> {
  const result = await prisma.like.aggregate({ _sum: { count: true } });
  return result._sum.count ?? 0;
}

/**
 * Get like counts for all slugs at once (for rendering the index page).
 */
export async function getAllLikeCounts(): Promise<Record<string, number>> {
  const rows = await prisma.like.findMany();
  return Object.fromEntries(rows.map((r) => [r.slug, r.count]));
}

/**
 * Get the like count for a single post.
 */
export async function getLikeCount(slug: string): Promise<number> {
  const like = await prisma.like.findUnique({ where: { slug } });
  return like?.count ?? 0;
}
