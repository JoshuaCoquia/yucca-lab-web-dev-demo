'use server';

import { revalidatePath } from 'next/cache';
import prisma from './prisma';

/**
 * Server Action — upsert/increment the Like row for the given slug, then
 * revalidate the paths that render like counts so the index and post page
 * stay in sync. The DB is the single source of truth; counts cannot desync.
 */
export async function likePost(slug: string): Promise<number> {
  const updated = await prisma.like.upsert({
    where: { slug },
    create: { slug, count: 1 },
    update: { count: { increment: 1 } },
  });

  // Revalidate the index (global-total + all like-counts) and the post page
  revalidatePath('/');
  revalidatePath(`/posts/${slug}`);

  return updated.count;
}
