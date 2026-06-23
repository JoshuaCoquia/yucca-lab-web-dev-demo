'use client';

import { useMemo, useState } from 'react';
import type { Post } from '@/lib/content';
import PostCard from './PostCard';
import SearchSortBar, { type SortValue } from './SearchSortBar';

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
      <SearchSortBar
        search={search}
        sort={sort}
        onSearchChange={setSearch}
        onSortChange={setSort}
      />

      <ul className="grid gap-6 sm:grid-cols-2">
        {visible.map((post) => (
          <li key={post.slug} data-testid="post-card">
            <PostCard post={post} likeCount={likeCounts[post.slug] ?? 0} />
          </li>
        ))}
      </ul>
    </>
  );
}
