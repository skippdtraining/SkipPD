/**
 * @fileoverview Result area of the catalog: result count, sort menu and the
 * grid of course cards (or an empty-state message).
 */

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
  onToggleSave: (courseId: number) => void;
  onClearFilters: () => void;
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
}: CatalogGridProps) {
  const noun = courses.length === 1 ? 'opportunity' : 'opportunities';

  return (
    <section>
      <div className="catalog-top">
        <span>
          {courses.length} training {noun}
          {savedOnly ? ' saved' : ''}
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
          courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              saved={savedIds.includes(course.id)}
              onOpen={() => {
                onOpenCourse(course);
              }}
              onToggleSave={() => {
                onToggleSave(course.id);
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
    </section>
  );
}
