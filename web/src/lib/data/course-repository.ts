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
 * Current backend: in-memory sample data. Step 3 adds a Supabase one.
 */

import type {Course} from '../types';
import {createSampleCourseRepository} from './sample-course-repository';

/** Everything the app can ask about courses, independent of the backend. */
export interface CourseRepository {
  /** All published courses, in "recommended" order. */
  listCourses(): Promise<Course[]>;
}

/**
 * Returns the repository the app should use.
 * The single place to change when the backend changes.
 */
export function getCourseRepository(): CourseRepository {
  return createSampleCourseRepository();
}
