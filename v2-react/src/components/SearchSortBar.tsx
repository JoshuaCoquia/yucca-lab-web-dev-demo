export type SortValue = 'newest' | 'oldest' | 'title'

interface SearchSortBarProps {
  search: string
  sort: SortValue
  onSearchChange: (value: string) => void
  onSortChange: (value: SortValue) => void
}

export default function SearchSortBar({
  search,
  sort,
  onSearchChange,
  onSortChange,
}: SearchSortBarProps) {
  return (
    <div className="flex gap-4 mb-6">
      <input
        data-testid="search-input"
        type="text"
        placeholder="Search posts…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="flex-1 border rounded px-3 py-2 text-sm"
      />
      <select
        data-testid="sort-select"
        value={sort}
        onChange={(e) => onSortChange(e.target.value as SortValue)}
        className="border rounded px-3 py-2 text-sm"
      >
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="title">Title A–Z</option>
      </select>
    </div>
  )
}
