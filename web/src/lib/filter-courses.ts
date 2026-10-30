/**
 * @fileoverview Catalog search, filter and sort logic for listings stored
 * in this browser.
 *
 * Database courses are filtered by the server (lib/data/). Listings a
 * trainer creates with the listing form still live in localStorage, so the
 * same rules are applied to them here, in the browser. Kept as pure
 * functions (no React, no browser APIs) so they are easy to read and test.
 *
 * TEMPORARY: delete once the listing form saves to the database.
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
 * Returns a sorted copy. "recommended" keeps the original order. The sort is
 * stable, so courses with equal price or length keep their original order.
 */
export function sortCourses(courses: Course[], sort: CatalogFilters['sort']): Course[] {
  const sorted = [...courses];
  if (sort === 'low') sorted.sort((a, b) => a.price - b.price);
  if (sort === 'high') sorted.sort((a, b) => b.price - a.price);
  if (sort === 'duration') sorted.sort((a, b) => a.hours - b.hours);
  return sorted;
}
