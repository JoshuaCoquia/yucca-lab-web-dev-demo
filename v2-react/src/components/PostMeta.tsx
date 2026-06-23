import type { Post } from '../types'

interface PostMetaProps {
  post: Post
  variant?: 'card' | 'article'
}

export default function PostMeta({ post, variant = 'card' }: PostMetaProps) {
  if (variant === 'article') {
    return (
      <div className="flex items-center gap-4 text-sm text-gray-500 mb-8">
        <time>{post.date}</time>
        <span className="text-blue-600">{post.tags.join(', ')}</span>
      </div>
    )
  }

  return (
    <>
      <p data-testid="post-date" className="text-sm text-gray-500">
        {post.date}
      </p>
      <p data-testid="post-tags" className="text-xs text-blue-600">
        {post.tags.join(', ')}
      </p>
    </>
  )
}
