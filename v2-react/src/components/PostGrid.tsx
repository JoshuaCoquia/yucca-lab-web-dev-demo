import type { Post } from '../types'
import PostCard from './PostCard'

interface PostGridProps {
  posts: Post[]
  likes: Record<string, number>
  onLike: (slug: string) => void
}

export default function PostGrid({ posts, likes, onLike }: PostGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {posts.map((post) => (
        <PostCard
          key={post.slug}
          post={post}
          likeCount={likes[post.slug] ?? 0}
          onLike={() => onLike(post.slug)}
        />
      ))}
    </div>
  )
}
