import { marked } from 'marked'
import type { Post } from '../types'
import PostMeta from './PostMeta'

interface PostArticleProps {
  post: Post
}

export default function PostArticle({ post }: PostArticleProps) {
  const htmlBody = marked(post.body) as string

  return (
    <article>
      <h1 data-testid="post-title" className="text-3xl font-bold text-gray-900 mb-3">
        {post.title}
      </h1>
      <PostMeta post={post} variant="article" />
      <div
        data-testid="post-body"
        className="prose prose-gray max-w-none text-gray-800 leading-relaxed [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-2 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1 [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:rounded [&_pre]:bg-gray-100 [&_pre]:p-4 [&_pre]:rounded [&_pre]:overflow-x-auto [&_a]:text-blue-600 [&_a]:hover:underline [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600"
        dangerouslySetInnerHTML={{ __html: htmlBody }}
      />
    </article>
  )
}
