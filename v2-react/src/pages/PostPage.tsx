import { useParams, Link } from 'react-router'
import { marked } from 'marked'
import { posts } from '../content/posts'

export default function PostPage() {
  const { slug } = useParams<{ slug: string }>()
  const post = posts.find((p) => p.slug === slug)

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">Post not found.</p>
          <Link data-testid="back-link" to="/" className="text-blue-600 hover:underline text-sm">
            &larr; Back to all posts
          </Link>
        </div>
      </div>
    )
  }

  const htmlBody = marked(post.body) as string

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4">
        <Link data-testid="back-link" to="/" className="text-blue-600 hover:underline text-sm font-medium">
          &larr; Back to all posts
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <article>
          <h1 data-testid="post-title" className="text-3xl font-bold text-gray-900 mb-3">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-8">
            <time>{post.date}</time>
            <span className="text-blue-600">{post.tags.join(', ')}</span>
          </div>
          <div
            data-testid="post-body"
            className="prose prose-gray max-w-none text-gray-800 leading-relaxed [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-2 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1 [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:rounded [&_pre]:bg-gray-100 [&_pre]:p-4 [&_pre]:rounded [&_pre]:overflow-x-auto [&_a]:text-blue-600 [&_a]:hover:underline [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600"
            dangerouslySetInnerHTML={{ __html: htmlBody }}
          />
        </article>
      </main>
    </div>
  )
}
