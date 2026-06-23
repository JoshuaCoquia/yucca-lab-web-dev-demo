import { getAllPosts } from '@/lib/content';
import { getAllLikeCounts } from '@/lib/db';
import PostBrowser from './components/PostBrowser';

// Server Component — reads all posts and like counts at request time.
// DB may not be available during a cold static pre-render (CI builds the DB
// before this page is served, so runtime is always fine).
export default async function HomePage() {
  const posts = getAllPosts();
  let likeCounts: Record<string, number> = {};
  try {
    likeCounts = await getAllLikeCounts();
  } catch {
    // DB not yet available (e.g. first SSG pass without migrate) — default to 0.
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Latest Posts</h2>
        <p className="mt-1 text-muted-foreground">Server-rendered with Next.js App Router.</p>
      </div>
      <PostBrowser posts={posts} likeCounts={likeCounts} />
    </div>
  );
}
