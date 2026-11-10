/**
 * @fileoverview {@link CourseRepository} backed by Supabase (Postgres).
 *
 * The only file that knows the Supabase catalog table and column names (the
 * shared row mapping lives in `listing-row.ts`). It turns a `CourseQuery`
 * (lib/types.ts) into a database query, so search, filters and sorting run in
 * the database, and converts rows into the app's {@link Course} type.
 * Tables are defined in `supabase/migrations/0001_catalog.sql` and
 * `0011_listings_owner.sql`.
 *
 * Server only: it is imported by `app/page.tsx` and `app/api/courses`.
 */

import {SHORT_COURSE_MAX_HOURS} from '@/config/catalog';
import {getPublicClient} from '@/lib/supabase/clients';
import type {CourseRepository} from './course-repository';
import {
  LISTING_COLUMNS,
  loadTrainerBadges,
  toCourse,
  type ListingRow,
} from './listing-row';

/** Escapes LIKE wildcards so a search for "50%" matches the text "50%". */
function escapeLike(text: string): string {
  return text.replace(/[\\%_]/g, (character) => `\\${character}`);
}

/** Repository that reads published listings from Supabase. */
export function createSupabaseCourseRepository(): CourseRepository {
  return {
    async searchCourses(query) {
      let request = getPublicClient().from('listings').select(LISTING_COLUMNS);

      const text = query.query.toLowerCase().trim();
      if (text !== '') request = request.ilike('search_text', `%${escapeLike(text)}%`);
      if (query.formats.length > 0) request = request.in('format', query.formats);
      if (query.grade !== '') request = request.contains('grades', [query.grade]);
      if (query.duration === 'short')
        request = request.lte('hours', SHORT_COURSE_MAX_HOURS);
      if (query.duration === 'long')
        request = request.gt('hours', SHORT_COURSE_MAX_HOURS);
      // The UI labels these options "Under $X", so the limit itself is excluded.
      if (query.maxPrice !== null) request = request.lt('price_usd', query.maxPrice);

      if (query.sort === 'low') request = request.order('price_usd', {ascending: true});
      if (query.sort === 'high') request = request.order('price_usd', {ascending: false});
      if (query.sort === 'duration') request = request.order('hours', {ascending: true});
      // Ties (and "recommended") fall back to the curated order.
      request = request.order('recommended_rank').order('id');

      const {data, error} = await request.returns<ListingRow[]>();
      if (error) throw new Error(`Could not load courses: ${error.message}`);
      const badges = await loadTrainerBadges(data);
      return data.map((row) =>
        toCourse(row, row.owner_id === null ? undefined : badges.get(row.owner_id)),
      );
    },

    async listCategories() {
      const {data, error} = await getPublicClient()
        .from('categories')
        .select('name')
        .order('sort_order')
        .returns<{name: string}[]>();
      if (error) throw new Error(`Could not load categories: ${error.message}`);
      return data.map((row) => row.name);
    },
  };
}
