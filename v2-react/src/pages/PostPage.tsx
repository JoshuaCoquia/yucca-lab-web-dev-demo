import { useParams, Link } from 'react-router'

export default function PostPage() {
  const { slug } = useParams<{ slug: string }>()

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <Link data-testid="back-link" to="/" className="text-blue-600 hover:underline">
        &larr; Back
      </Link>
      <p className="mt-4 text-gray-500">Post &ldquo;{slug}&rdquo; coming soon.</p>
    </main>
  )
}
