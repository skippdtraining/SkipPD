/**
 * @fileoverview Route for "/" (the home page).
 *
 * This is a server component: it runs on the server and passes data down.
 * In Step 2 it will fetch courses from Supabase here instead of using the
 * sample list. The interactive UI lives in `components/HomePage.tsx`.
 *
 * Note: Next.js requires a *default* export for pages, an exception to our
 * named-exports rule (see docs/CONVENTIONS.md).
 */

import {HomePage} from '@/components/HomePage';
import {SAMPLE_COURSES} from '@/lib/sample-courses';

export default function Home() {
  return <HomePage courses={SAMPLE_COURSES} />;
}
