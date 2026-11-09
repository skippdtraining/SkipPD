/**
 * @fileoverview Page arrows and page numbers, shared by the catalog and the
 * admin review queue. Renders nothing when everything fits on one page.
 */

interface PaginationProps {
  /** Current page, starting at 1. */
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  /** Screen-reader name, e.g. "Catalog pages". */
  label: string;
}

/** ← 1 2 3 → navigation. */
export function Pagination({page, pageCount, onPageChange, label}: PaginationProps) {
  if (pageCount <= 1) return null;
  return (
    <nav className="pagination" aria-label={label}>
      <button
        className="page-arrow"
        aria-label="Previous page"
        disabled={page === 1}
        onClick={() => {
          onPageChange(page - 1);
        }}
      >
        ←
      </button>
      {Array.from({length: pageCount}, (_, index) => index + 1).map((number) => (
        <button
          key={number}
          className={`page-number ${number === page ? 'active' : ''}`}
          aria-label={`Page ${number}`}
          aria-current={number === page ? 'page' : undefined}
          onClick={() => {
            onPageChange(number);
          }}
        >
          {number}
        </button>
      ))}
      <button
        className="page-arrow"
        aria-label="Next page"
        disabled={page === pageCount}
        onClick={() => {
          onPageChange(page + 1);
        }}
      >
        →
      </button>
    </nav>
  );
}
