/**
 * @fileoverview Route for `GET /api/courses`: catalog search for the browser.
 *
 * The catalog calls this whenever a search, filter or sort control changes.
 * It decodes the URL params (see lib/course-query-params.ts) and asks the
 * course repository, so filtering runs in the database, not in the browser.
 * Responses are always fresh, so edits in the Supabase dashboard show up on
 * the next search.
 */

import type {NextRequest} from 'next/server';
import {paramsToCourseQuery} from '@/lib/course-query-params';
import {getCourseRepository} from '@/lib/data/course-repository';

/** Returns `{courses: Course[]}` matching the query in the URL. */
export async function GET(request: NextRequest) {
  const query = paramsToCourseQuery(request.nextUrl.searchParams);
  try {
    const courses = await getCourseRepository().searchCourses(query);
    return Response.json({courses});
  } catch (error) {
    console.error(error);
    return Response.json({error: 'Could not load courses.'}, {status: 500});
  }
}
