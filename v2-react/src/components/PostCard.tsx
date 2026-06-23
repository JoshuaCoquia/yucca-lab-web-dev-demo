import { Link } from 'react-router'
import type { Post } from '../types'
import PostMeta from './PostMeta'

interface PostCardProps {
  post: Post
  likeCount: number
  onLike: () => void
}

export default function PostCard({ post, likeCount, onLike }: PostCardProps) {
  return (
    <article data-testid="post-card" className="border rounded-lg p-4 flex flex-col gap-2 bg-white">
      <h2 data-testid="post-title" className="text-lg font-semibold">
        {post.title}
      </h2>
      <PostMeta post={post} variant="card" />
      <p data-testid="post-excerpt" className="text-sm text-gray-700 flex-1">
        {post.excerpt}
      </p>
      <div className="flex items-center gap-3 mt-2">
        <button
          data-testid="like-button"
          onClick={onLike}
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
  )
}
