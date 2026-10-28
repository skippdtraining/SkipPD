/**
 * @fileoverview Route for "/" (the home page).
 *
 * This is a server component: it runs on the server and passes data down.
 * It asks the course repository for data, so it does not know or care
 * which database is behind it (see lib/data/course-repository.ts). The interactive UI lives in `components/HomePage.tsx`.
 *
 * Note: Next.js requires a *default* export for pages, an exception to our
 * named-exports rule (see docs/CONVENTIONS.md).
 */

import {HomePage} from '@/components/HomePage';
import {getCourseRepository} from '@/lib/data/course-repository';

export default async function Home() {
  const courses = await getCourseRepository().listCourses();
  return <HomePage courses={courses} />;
}
