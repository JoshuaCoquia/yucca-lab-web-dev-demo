import Link from 'next/link';
import { getAllPosts } from '@/lib/content';
import { getAllLikeCounts } from '@/lib/db';
import LikeButton from './components/LikeButton';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
      <ul className="grid gap-6 sm:grid-cols-2">
        {posts.map((post) => (
          <li key={post.slug} data-testid="post-card">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>
                  <h3 data-testid="post-title" className="text-base font-semibold leading-snug">
                    {post.title}
                  </h3>
                </CardTitle>
                <time data-testid="post-date" className="text-xs text-muted-foreground">
                  {post.date}
                </time>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-3">
                <div data-testid="post-tags" className="flex gap-1.5 flex-wrap">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <p data-testid="post-excerpt" className="text-sm text-muted-foreground flex-1">
                  {post.excerpt}
                </p>
              </CardContent>
              <CardFooter className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <LikeButton slug={post.slug} initialCount={likeCounts[post.slug] ?? 0} />
                </div>
                <Link
                  href={`/posts/${post.slug}`}
                  data-testid="read-link"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Read more →
                </Link>
              </CardFooter>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
