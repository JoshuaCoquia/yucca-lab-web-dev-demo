'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Post } from '@/lib/content';
import LikeButton from './LikeButton';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type SortValue = 'newest' | 'oldest' | 'title';

interface PostBrowserProps {
  posts: Post[];
  likeCounts: Record<string, number>;
}

// Client island over the server-fetched post list. Search + sort are derived
// state from a single `posts` array (same model as v2-react) — the server still
// owns the content; this only reorders/filters what was rendered at request time.
export default function PostBrowser({ posts, likeCounts }: PostBrowserProps) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortValue>('newest');

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const result = q
      ? posts.filter((p) => p.title.toLowerCase().includes(q))
      : [...posts];

    if (sort === 'oldest') {
      result.sort((a, b) => a.date.localeCompare(b.date));
    } else if (sort === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      // newest (default) — descending date
      result.sort((a, b) => b.date.localeCompare(a.date));
    }

    return result;
  }, [posts, search, sort]);

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          data-testid="search-input"
          type="text"
          placeholder="Search posts…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        />
        <select
          data-testid="sort-select"
          value={sort}
          onChange={(e) => setSort(e.target.value as SortValue)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="title">Title A–Z</option>
        </select>
      </div>

      <ul className="grid gap-6 sm:grid-cols-2">
        {visible.map((post) => (
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
    </>
  );
}
