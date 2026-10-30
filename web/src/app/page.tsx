/**
 * @fileoverview Route for "/" (the home page).
 *
 * This is a server component: it runs on the server and passes data down.
 * It asks the course repository for data, so it does not know or care
 * which database is behind it (see lib/data/course-repository.ts). The
 * interactive UI lives in `components/HomePage.tsx`.
 *
 * Courses are read on every request (not cached), so an edit in the
 * Supabase dashboard shows up on the next page load.
 *
 * Note: Next.js requires a *default* export for pages, an exception to our
 * named-exports rule (see docs/CONVENTIONS.md).
 */

import {connection} from 'next/server';
import {Suspense} from 'react';
import {HomePage} from '@/components/HomePage';
import {getCourseRepository} from '@/lib/data/course-repository';
import {toCourseQuery} from '@/lib/catalog-api';
import {DEFAULT_FILTERS} from '@/lib/types';

/** Loads the first catalog results and the topic list, then renders the page. */
async function HomeWithData() {
  // Opt out of build-time prerendering: data must be fresh per request.
  await connection();
  const repository = getCourseRepository();
  const [initialCourses, categories] = await Promise.all([
    repository.searchCourses(toCourseQuery(DEFAULT_FILTERS, [])),
    repository.listCategories(),
  ]);
  return <HomePage initialCourses={initialCourses} categories={categories} />;
}

export default function Home() {
  return (
    <Suspense>
      <HomeWithData />
    </Suspense>
  );
}
