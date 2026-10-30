/**
 * @fileoverview Browser-side helper that asks `/api/courses` for catalog
 * results.
 *
 * Why this exists: components should not build URLs or parse responses.
 * The catalog calls {@link fetchCourses}; the route and the database query
 * live on the server (app/api/courses/route.ts).
 */

import {courseQueryToParams} from './course-query-params';
import type {Course, CourseQuery} from './types';

/**
 * Returns the server's courses for a query.
 *
 * @param signal Lets the caller cancel a request that a newer one replaced.
 * @throws When the request fails or the server reports an error.
 */
export async function fetchCourses(
  query: CourseQuery,
  signal?: AbortSignal,
): Promise<Course[]> {
  const response = await fetch(`/api/courses?${courseQueryToParams(query)}`, {signal});
  if (!response.ok) throw new Error(`Course search failed (${response.status}).`);
  // Safe: the route always answers 200 with `{courses: Course[]}`.
  const body = (await response.json()) as {courses: Course[]};
  return body.courses;
}

/** Turns catalog filters + the browser's saved ids into a server query. */
export function toCourseQuery(
  {savedOnly, ...filters}: {savedOnly: boolean} & Omit<CourseQuery, 'ids'>,
  savedIds: number[],
): CourseQuery {
  return savedOnly ? {...filters, ids: savedIds} : filters;
}
