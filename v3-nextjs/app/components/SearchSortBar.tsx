export type SortValue = 'newest' | 'oldest' | 'title';

interface SearchSortBarProps {
  search: string;
  sort: SortValue;
  onSearchChange: (value: string) => void;
  onSortChange: (value: SortValue) => void;
}

// Controlled search input + sort select. Stateless — PostBrowser owns the
// state and the filter/sort logic; this just renders the controls.
export default function SearchSortBar({
  search,
  sort,
  onSearchChange,
  onSortChange,
}: SearchSortBarProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row">
      <input
        data-testid="search-input"
        type="text"
        placeholder="Search posts…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
      />
      <select
        data-testid="sort-select"
        value={sort}
        onChange={(e) => onSortChange(e.target.value as SortValue)}
        className="rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
      >
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="title">Title A–Z</option>
      </select>
    </div>
  );
}
