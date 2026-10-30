/**
 * @fileoverview Catalog search box, used in two places:
 * - "hero": the large box in the landing section;
 * - "compact": the small box that appears in the sticky header once the
 *   hero box has scrolled out of view.
 * Both read and write the same query, so typing in one updates the other.
 */

interface SearchBoxProps {
  variant: 'hero' | 'compact';
  query: string;
  onQueryChange: (query: string) => void;
  /** Called on Enter / Search button; scrolls to the results. */
  onSearch: () => void;
}

/** Search input with a submit button. */
export function SearchBox({variant, query, onQueryChange, onSearch}: SearchBoxProps) {
  const isCompact = variant === 'compact';

  return (
    <form
      className={`search ${isCompact ? 'search-compact' : ''}`}
      role="search"
      onSubmit={(event) => {
        // Stop the browser from reloading the page on submit.
        event.preventDefault();
        onSearch();
      }}
    >
      <span aria-hidden="true">⌕</span>
      <input
        type="search"
        value={query}
        onChange={(event) => {
          onQueryChange(event.target.value);
        }}
        placeholder={isCompact ? 'Search training' : 'What would you like to learn?'}
        aria-label="Search training, trainer, or keyword"
      />
      <button className={`btn ${isCompact ? 'small' : ''}`} type="submit">
        Search
      </button>
    </form>
  );
}
