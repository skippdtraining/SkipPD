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

interface CatalogGridProps {
  /** Courses already filtered and sorted. */
  courses: Course[];
  savedIds: number[];
  sort: CatalogFilters['sort'];
  savedOnly: boolean;
  onSortChange: (sort: CatalogFilters['sort']) => void;
  onOpenCourse: (course: Course) => void;
  /** Omitted for guests: hearts are hidden. */
  onToggleSave?: (courseId: number) => void;
  onClearFilters: () => void;
  /** Current page, starting at 1. */
  page: number;
  onPageChange: (page: number) => void;
  /** Leaves the Saved view. */
  onShowAll: () => void;
}

/** Result count + sort menu + course cards. */
export function CatalogGrid({
  courses,
  savedIds,
  sort,
  savedOnly,
  onSortChange,
  onOpenCourse,
  onToggleSave,
  onClearFilters,
  page,
  onPageChange,
  onShowAll,
}: CatalogGridProps) {
  const pageCount = Math.max(1, Math.ceil(courses.length / COURSES_PER_PAGE));
  // Clamp in case the list shrank (e.g. a course was unsaved on the last page).
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
          {savedOnly ? ' saved' : ''}
          {savedOnly && (
            <button className="link-button" onClick={onShowAll}>
              Show all trainings
            </button>
          )}
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
              saved={savedIds.includes(course.id)}
              onOpen={() => {
                onOpenCourse(course);
              }}
              onToggleSave={
                onToggleSave &&
                (() => {
                  onToggleSave(course.id);
                })
              }
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

      {pageCount > 1 && (
        <nav className="pagination" aria-label="Catalog pages">
          <button
            className="page-arrow"
            aria-label="Previous page"
            disabled={currentPage === 1}
            onClick={() => {
              onPageChange(currentPage - 1);
            }}
          >
            ←
          </button>
          {Array.from({length: pageCount}, (_, index) => index + 1).map((number) => (
            <button
              key={number}
              className={`page-number ${number === currentPage ? 'active' : ''}`}
              aria-label={`Page ${number}`}
              aria-current={number === currentPage ? 'page' : undefined}
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
            disabled={currentPage === pageCount}
            onClick={() => {
              onPageChange(currentPage + 1);
            }}
          >
            →
          </button>
        </nav>
      )}
    </section>
  );
}
