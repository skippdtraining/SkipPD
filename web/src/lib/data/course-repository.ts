/**
 * @fileoverview Data-access contract for courses.
 *
 * Why this exists: pages and components must never talk to a specific
 * database (Supabase, AWS, ...) directly. They only call the
 * {@link CourseRepository} interface. Each storage backend gets its own
 * implementation file, and {@link getCourseRepository} picks one. Switching
 * databases then means writing one new file and changing one line here,
 * with no changes to the UI.
 *
 * Current backend: Supabase (see supabase-course-repository.ts).
 */

import type {CourseQuery, Course} from '../types';
import {createSupabaseCourseRepository} from './supabase-course-repository';

/** Everything the app can ask about courses, independent of the backend. */
export interface CourseRepository {
  /**
   * Published courses matching the query, in the requested order.
   * Search, filtering and sorting all run in the backend.
   */
  searchCourses(query: CourseQuery): Promise<Course[]>;

  /** Suggested topic names for the listing form, in display order. */
  listCategories(): Promise<string[]>;
}

/**
 * Returns the repository the app should use.
 * The single place to change when the backend changes.
 */
export function getCourseRepository(): CourseRepository {
  return createSupabaseCourseRepository();
}
