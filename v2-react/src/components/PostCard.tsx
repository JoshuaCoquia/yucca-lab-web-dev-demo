import { Link } from 'react-router';
import type { Post } from '../types';

interface PostCardProps {
  post: Post;
  likeCount: number;
  onLike: (slug: string) => void;
}

export default function PostCard({ post, likeCount, onLike }: PostCardProps) {
  return (
    <article data-testid="post-card" className="border rounded-lg p-4 flex flex-col gap-2">
      <h2 data-testid="post-title" className="text-lg font-semibold">
        {post.title}
      </h2>
      <p data-testid="post-date" className="text-sm text-gray-500">
        {post.date}
      </p>
      <p data-testid="post-tags" className="text-xs text-blue-600">
        {post.tags.join(', ')}
      </p>
      <p data-testid="post-excerpt" className="text-sm text-gray-700">
        {post.excerpt}
      </p>
      <div className="flex items-center gap-3 mt-auto">
        <button
          data-testid="like-button"
          onClick={() => onLike(post.slug)}
          className="px-3 py-1 bg-pink-100 hover:bg-pink-200 rounded text-sm"
        >
          ♥
        </button>
        <span data-testid="like-count" className="text-sm">
          {likeCount}
        </span>
        <Link
          data-testid="read-link"
          to={`/posts/${post.slug}`}
          className="ml-auto text-sm text-blue-600 hover:underline"
        >
          Read →
        </Link>
      </div>
    </article>
  );
}
