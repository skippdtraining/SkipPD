/**
 * @fileoverview Catalog controls: the topic chips above the grid and the
 * filter panel on its left. Both only report changes upward; the actual
 * filtering happens in `lib/filter-courses.ts`.
 *
 * On phones the filter panel is collapsed behind a "Filters" button so the
 * results are visible first (the button is hidden on larger screens by CSS).
 */

'use client';

import {useState} from 'react';
import {PRICE_FILTER_OPTIONS, SHORT_COURSE_MAX_HOURS} from '@/config/catalog';
import {formatPrice} from '@/lib/format';
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

  // Only affects phones: CSS ignores this state on larger screens.
  const [open, setOpen] = useState(false);
  const activeCount =
    filters.formats.length +
    (filters.grade !== '' ? 1 : 0) +
    (filters.duration !== '' ? 1 : 0) +
    (filters.maxPrice !== null ? 1 : 0);

  return (
    <aside className={`filters ${open ? 'open' : ''}`}>
      <button
        className="btn light filters-toggle"
        aria-expanded={open}
        onClick={() => {
          setOpen(!open);
        }}
      >
        <span>Filters{activeCount > 0 ? ` (${activeCount})` : ''}</span>
        <span aria-hidden="true">{open ? '▴' : '▾'}</span>
      </button>
      <div className="filter-panel">
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
            <option value="short">Up to {SHORT_COURSE_MAX_HOURS} hours</option>
            <option value="long">More than {SHORT_COURSE_MAX_HOURS} hours</option>
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
            {PRICE_FILTER_OPTIONS.map((limit) => (
              <option key={limit} value={limit}>
                Under {formatPrice(limit)}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-note">
          <b>Planning a school PD day?</b>
          Open a course to request a team session and discuss your needs.
        </div>
      </div>
    </aside>
  );
}
