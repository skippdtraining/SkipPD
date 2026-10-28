/**
 * @fileoverview {@link CourseRepository} backed by the hard-coded POC sample
 * courses. TEMPORARY: replaced by a Supabase implementation in Step 2.
 */

import type {CourseRepository} from './course-repository';
import {SAMPLE_COURSES} from './sample-courses';

/** Repository that serves the six sample courses from memory. */
export function createSampleCourseRepository(): CourseRepository {
  return {
    async listCourses() {
      return SAMPLE_COURSES;
    },
  };
}
