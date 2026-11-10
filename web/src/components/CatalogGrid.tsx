/**
 * @fileoverview Result area of the catalog: result count, sort menu and the
 * grid of course cards (or an empty-state message), and page arrows.
 *
 * Why pages: showing every course makes the page very long. At most
 * COURSES_PER_PAGE cards are shown; arrows and page numbers move between
 * pages. The server returns every matching course and pages are sliced
 * here, because browser-only listings are merged in first. Once listings
 * are saved to the database, the server can return one page at a time.
 */

import {COURSES_PER_PAGE} from '@/config/catalog';
import type {CatalogFilters, Course} from '@/lib/types';
import {CourseCard} from './CourseCard';
import {Pagination} from './Pagination';

interface CatalogGridProps {
  /** Courses already filtered and sorted. */
  courses: Course[];
  sort: CatalogFilters['sort'];
  onSortChange: (sort: CatalogFilters['sort']) => void;
  onOpenCourse: (course: Course) => void;
  onClearFilters: () => void;
  /** Current page, starting at 1. */
  page: number;
  onPageChange: (page: number) => void;
}

/** Result count + sort menu + course cards. */
export function CatalogGrid({
  courses,
  sort,
  onSortChange,
  onOpenCourse,
  onClearFilters,
  page,
  onPageChange,
}: CatalogGridProps) {
  const pageCount = Math.max(1, Math.ceil(courses.length / COURSES_PER_PAGE));
  // Clamp in case the list shrank (e.g. a filter left fewer pages).
  const currentPage = Math.min(page, pageCount);
  const pageCourses = courses.slice(
    (currentPage - 1) * COURSES_PER_PAGE,
    currentPage * COURSES_PER_PAGE,
  );
  const noun = courses.length === 1 ? 'opportunity' : 'opportunities';

  return (
    <section>
      <div className="catalog-top">
        <span>
          {courses.length} training {noun}
        </span>
        <label>
          Sort by{' '}
          <select
            aria-label="Sort courses"
            value={sort}
            onChange={(event) => {
              onSortChange(event.target.value as CatalogFilters['sort']);
            }}
          >
            <option value="recommended">Recommended</option>
            <option value="low">Price: low to high</option>
            <option value="high">Price: high to low</option>
            <option value="duration">Duration</option>
          </select>
        </label>
      </div>

      <div className="grid">
        {courses.length > 0 ? (
          pageCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onOpen={() => {
                onOpenCourse(course);
              }}
            />
          ))
        ) : (
          <div className="empty">
            No training matches your selection.
            <br />
            <br />
            <button className="btn light small" onClick={onClearFilters}>
              Clear filters
            </button>
          </div>
        )}
      </div>

      <Pagination
        page={currentPage}
        pageCount={pageCount}
        onPageChange={onPageChange}
        label="Catalog pages"
      />
    </section>
  );
}
