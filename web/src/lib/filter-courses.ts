/**
 * @fileoverview Catalog search, filter and sort logic.
 *
 * Kept as a pure function (no React, no browser APIs) so it is easy to read
 * and test. In Step 2 the same filtering moves into database queries; the
 * {@link CatalogFilters} shape stays the same so the UI does not change.
 */

import {SHORT_COURSE_MAX_HOURS} from '@/config/catalog';
import type {CatalogFilters, Course} from './types';

/**
 * Returns the courses that match every active filter, in the chosen order.
 *
 * @param courses All courses that could be shown.
 * @param filters Current state of the catalog controls.
 * @param savedIds Ids the user bookmarked; used only when `savedOnly` is on.
 */
export function filterCourses(
  courses: Course[],
  filters: CatalogFilters,
  savedIds: number[],
): Course[] {
  const matching = courses.filter((course) => matchesFilters(course, filters, savedIds));
  return sortCourses(matching, filters.sort);
}

/** True when a single course passes every active filter. */
function matchesFilters(
  course: Course,
  filters: CatalogFilters,
  savedIds: number[],
): boolean {
  if (filters.savedOnly && !savedIds.includes(course.id)) return false;

  if (filters.category !== 'All topics' && course.category !== filters.category) {
    return false;
  }

  const query = filters.query.toLowerCase().trim();
  if (query !== '') {
    const searchableText = [course.title, course.category, course.trainer, ...course.tags]
      .join(' ')
      .toLowerCase();
    if (!searchableText.includes(query)) return false;
  }

  if (filters.formats.length > 0 && !filters.formats.includes(course.format)) {
    return false;
  }

  if (filters.grade !== '' && !course.grades.includes(filters.grade)) {
    return false;
  }

  const isShort = course.hours <= SHORT_COURSE_MAX_HOURS;
  if (filters.duration === 'short' && !isShort) return false;
  if (filters.duration === 'long' && isShort) return false;

  // The POC labels these options "Under $X", so the limit itself is excluded.
  if (filters.maxPrice !== null && course.price >= filters.maxPrice) {
    return false;
  }

  return true;
}

/**
 * Returns a sorted copy. "recommended" keeps the original order, which for
 * now is newest browser listings first, then the sample courses.
 */
function sortCourses(courses: Course[], sort: CatalogFilters['sort']): Course[] {
  const sorted = [...courses];
  if (sort === 'low') sorted.sort((a, b) => a.price - b.price);
  if (sort === 'high') sorted.sort((a, b) => b.price - a.price);
  if (sort === 'duration') sorted.sort((a, b) => a.hours - b.hours);
  return sorted;
}
