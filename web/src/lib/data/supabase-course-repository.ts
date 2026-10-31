/**
 * @fileoverview {@link CourseRepository} backed by Supabase (Postgres).
 *
 * The only file that knows the Supabase table and column names. It turns a
 * `CourseQuery` (lib/types.ts) into a database query, so search, filters and sorting
 * run in the database, and converts rows into the app's {@link Course} type.
 * Tables are defined in `supabase/migrations/0001_catalog.sql`.
 *
 * Server only: it is imported by `app/page.tsx` and `app/api/courses`.
 */

import {SHORT_COURSE_MAX_HOURS} from '@/config/catalog';
import {getPublicClient} from '@/lib/supabase/clients';
import type {Course, CoverType, Format, Grade} from '../types';
import type {CourseRepository} from './course-repository';

/** Columns read from `public.listings`, in database naming. */
interface ListingRow {
  id: number;
  title: string;
  category: string;
  trainer_name: string;
  trainer_role: string;
  format: string;
  hours: number | string;
  price_usd: number | string;
  grades: string[];
  tags: string[];
  description: string;
  outcomes: string[];
  cover_color: string;
  cover_accent: string;
  cover_type: string;
}

const LISTING_COLUMNS =
  'id, title, category, trainer_name, trainer_role, format, hours, price_usd, grades, ' +
  'tags, description, outcomes, cover_color, cover_accent, cover_type';

/** Escapes LIKE wildcards so a search for "50%" matches the text "50%". */
function escapeLike(text: string): string {
  return text.replace(/[\\%_]/g, (character) => `\\${character}`);
}

/** Converts a database row into the app's {@link Course} type. */
function toCourse(row: ListingRow): Course {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    trainer: row.trainer_name,
    role: row.trainer_role,
    // Safe: the table's CHECK constraints only allow these values.
    format: row.format as Format,
    grades: row.grades as Grade[],
    type: row.cover_type as CoverType,
    // Postgres `numeric` may arrive as a string; normalise to number.
    hours: Number(row.hours),
    price: Number(row.price_usd),
    tags: row.tags,
    description: row.description,
    outcomes: row.outcomes,
    color: row.cover_color,
    accent: row.cover_accent,
  };
}

/** Repository that reads published listings from Supabase. */
export function createSupabaseCourseRepository(): CourseRepository {
  return {
    async searchCourses(query) {
      // The Saved tab with nothing saved: skip the round trip.
      if (query.ids && query.ids.length === 0) return [];

      let request = getPublicClient().from('listings').select(LISTING_COLUMNS);

      const text = query.query.toLowerCase().trim();
      if (text !== '') request = request.ilike('search_text', `%${escapeLike(text)}%`);
      if (query.ids) request = request.in('id', query.ids);
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
      return data.map(toCourse);
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
