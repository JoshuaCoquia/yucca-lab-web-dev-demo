import { getLikesTotal } from '@/lib/db';

// Server Component — renders the live global like total.
// Re-fetched whenever revalidatePath('/') is called by the likePost action.
export default async function GlobalTotal() {
  let total = 0;
  try {
    total = await getLikesTotal();
  } catch {
    // DB may not be ready during static prerender of non-main pages; default to 0.
  }
  return <span data-testid="global-total">{total}</span>;
}
