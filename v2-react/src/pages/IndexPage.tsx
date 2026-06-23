import { useState, useMemo } from 'react'
import { posts } from '../content/posts'
import PostCard from '../components/PostCard'

type SortValue = 'newest' | 'oldest' | 'title'

export default function IndexPage() {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortValue>('newest')
  // Likes state: record of slug -> count (shared state for feature 5)
  const [likes] = useState<Record<string, number>>({})

  const globalTotal = Object.values(likes).reduce((sum, n) => sum + n, 0)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    let result = q
      ? posts.filter((p) => p.title.toLowerCase().includes(q))
      : [...posts]

    if (sort === 'newest') {
      result = result.sort((a, b) => b.date.localeCompare(a.date))
    } else if (sort === 'oldest') {
      result = result.sort((a, b) => a.date.localeCompare(b.date))
    } else if (sort === 'title') {
      result = result.sort((a, b) => a.title.localeCompare(b.title))
    }

    return result
  }, [search, sort])

  function handleLike(_slug: string) {
    // Likes feature implemented in a later step
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">YuCCA Dev Blog</h1>
        <span data-testid="global-total" className="text-sm text-gray-500">
          {globalTotal}
        </span>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex gap-4 mb-6">
          <input
            data-testid="search-input"
            type="text"
            placeholder="Search posts…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border rounded px-3 py-2 text-sm"
          />
          <select
            data-testid="sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortValue)}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="title">Title A–Z</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((post) => (
            <PostCard
              key={post.slug}
              post={post}
              likeCount={likes[post.slug] ?? 0}
              onLike={handleLike}
            />
          ))}
        </div>
      </main>
    </div>
  )
}
