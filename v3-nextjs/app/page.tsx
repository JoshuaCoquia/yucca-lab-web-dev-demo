import Link from 'next/link';
import { getAllPosts } from '@/lib/content';

// Server Component — reads all posts at build time (SSG)
export default function HomePage() {
  const posts = getAllPosts();

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <ul className="grid gap-6 sm:grid-cols-2">
        {posts.map((post) => (
          <li key={post.slug} data-testid="post-card" className="border rounded-lg p-5 flex flex-col gap-3">
            <h2 data-testid="post-title" className="text-lg font-semibold leading-snug">
              {post.title}
            </h2>
            <time data-testid="post-date" className="text-sm text-zinc-500">
              {post.date}
            </time>
            <ul data-testid="post-tags" className="flex gap-2 flex-wrap">
              {post.tags.map((tag) => (
                <li key={tag} className="text-xs bg-zinc-100 px-2 py-0.5 rounded">
                  {tag}
                </li>
              ))}
            </ul>
            <p data-testid="post-excerpt" className="text-sm text-zinc-600 flex-1">
              {post.excerpt}
            </p>
            <div className="flex items-center gap-4 mt-auto">
              <button
                data-testid="like-button"
                className="text-sm border rounded px-3 py-1 hover:bg-zinc-50"
              >
                Like
              </button>
              <span data-testid="like-count" className="text-sm text-zinc-500">
                0
              </span>
              <Link
                href={`/posts/${post.slug}`}
                data-testid="read-link"
                className="text-sm text-blue-600 hover:underline ml-auto"
              >
                Read more
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
