import { useState, useMemo } from 'react'
import { posts } from '../content/posts'
import { useLikes } from '../LikesContext'
import Header from '../components/Header'
import PageShell from '../components/PageShell'
import SearchSortBar, { type SortValue } from '../components/SearchSortBar'
import PostGrid from '../components/PostGrid'

export default function IndexPage() {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortValue>('newest')
  const { likes, like, globalTotal } = useLikes()

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

  return (
    <PageShell
      header={
        <Header
          title="YuCCA Dev Blog"
          right={
            <span data-testid="global-total" className="text-sm text-gray-500">
              {globalTotal}
            </span>
          }
        />
      }
    >
      <SearchSortBar
        search={search}
        sort={sort}
        onSearchChange={setSearch}
        onSortChange={setSort}
      />
      <PostGrid posts={filtered} likes={likes} onLike={like} />
    </PageShell>
  )
}
