/**
 * @fileoverview Catalog controls: the topic chips above the grid and the
 * filter panel on its left. Both only report changes upward; the actual
 * filtering happens in `lib/filter-courses.ts`.
 */

import {CATEGORIES, FORMATS, GRADES, type CatalogFilters} from '@/lib/types';

interface FilterProps {
  filters: CatalogFilters;
  /** Merges the given fields into the current filters. */
  onChange: (patch: Partial<CatalogFilters>) => void;
}

/** Row of topic buttons ("All topics", "Literacy", ...). */
export function CategoryChips({filters, onChange}: FilterProps) {
  const options = ['All topics', ...CATEGORIES] as const;
  return (
    <div className="chips">
      {options.map((category) => (
        <button
          key={category}
          className={`chip ${category === filters.category ? 'active' : ''}`}
          onClick={() => {
            onChange({category});
          }}
        >
          {category}
        </button>
      ))}
    </div>
  );
}

interface FilterSidebarProps extends FilterProps {
  onClearAll: () => void;
}

/** Format, grade, duration and price filters. */
export function FilterSidebar({filters, onChange, onClearAll}: FilterSidebarProps) {
  function toggleFormat(format: CatalogFilters['formats'][number], checked: boolean) {
    const formats = checked
      ? [...filters.formats, format]
      : filters.formats.filter((f) => f !== format);
    onChange({formats});
  }

  return (
    <aside className="filters">
      <h3>
        Filters <button onClick={onClearAll}>Clear all</button>
      </h3>

      <div className="filter-group">
        <h4>Learning format</h4>
        {FORMATS.map((format) => (
          <label key={format} className="check">
            <input
              type="checkbox"
              checked={filters.formats.includes(format)}
              onChange={(event) => {
                toggleFormat(format, event.target.checked);
              }}
            />
            {format}
          </label>
        ))}
      </div>

      <div className="filter-group">
        <h4>Grade level</h4>
        <select
          aria-label="Grade level"
          value={filters.grade}
          onChange={(event) => {
            // Safe cast: the <option> values below are exactly the Grade values.
            onChange({grade: event.target.value as CatalogFilters['grade']});
          }}
        >
          <option value="">All grades</option>
          {GRADES.map((grade) => (
            <option key={grade}>{grade}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <h4>Duration</h4>
        <select
          aria-label="Course duration"
          value={filters.duration}
          onChange={(event) => {
            onChange({duration: event.target.value as CatalogFilters['duration']});
          }}
        >
          <option value="">Any duration</option>
          <option value="short">Up to 2 hours</option>
          <option value="long">More than 2 hours</option>
        </select>
      </div>

      <div className="filter-group">
        <h4>Price</h4>
        <select
          aria-label="Maximum price"
          value={filters.maxPrice ?? ''}
          onChange={(event) => {
            const value = event.target.value;
            onChange({maxPrice: value === '' ? null : Number(value)});
          }}
        >
          <option value="">Any price</option>
          <option value="75">Under $75</option>
          <option value="150">Under $150</option>
          <option value="300">Under $300</option>
        </select>
      </div>

      <div className="filter-note">
        <b>Planning a school PD day?</b>
        Open a course to request a team session and discuss your needs.
      </div>
    </aside>
  );
}
