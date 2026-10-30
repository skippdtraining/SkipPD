/**
 * @fileoverview Converts a {@link CourseQuery} to and from URL search params.
 *
 * Why this exists: the catalog asks `/api/courses` for results whenever a
 * filter changes. The browser encodes the query with
 * {@link courseQueryToParams}; the route decodes it with
 * {@link paramsToCourseQuery}. Keeping both halves here means they cannot
 * drift apart. Decoding treats input as untrusted: unknown values are
 * dropped, not passed to the database.
 */

import {FORMATS, GRADES, type CatalogFilters, type CourseQuery} from './types';

/** Longest search text accepted; longer input is cut. */
const MAX_QUERY_LENGTH = 100;

/** Most ids accepted for the Saved tab in one request. */
const MAX_IDS = 200;

const SORTS: CatalogFilters['sort'][] = ['recommended', 'low', 'high', 'duration'];
const DURATIONS: CatalogFilters['duration'][] = ['', 'short', 'long'];

/** Encodes a query for the `/api/courses` URL. Default values are left out. */
export function courseQueryToParams(query: CourseQuery): URLSearchParams {
  const params = new URLSearchParams();
  if (query.query.trim() !== '') params.set('q', query.query.trim());
  for (const format of query.formats) params.append('format', format);
  if (query.grade !== '') params.set('grade', query.grade);
  if (query.duration !== '') params.set('duration', query.duration);
  if (query.maxPrice !== null) params.set('maxPrice', String(query.maxPrice));
  if (query.sort !== 'recommended') params.set('sort', query.sort);
  if (query.ids) params.set('ids', query.ids.join(','));
  return params;
}

/** Decodes and validates params produced by {@link courseQueryToParams}. */
export function paramsToCourseQuery(params: URLSearchParams): CourseQuery {
  const grade = GRADES.find((value) => value === params.get('grade')) ?? '';
  const duration = DURATIONS.find((value) => value === params.get('duration')) ?? '';
  const sort = SORTS.find((value) => value === params.get('sort')) ?? 'recommended';
  const formats = FORMATS.filter((value) => params.getAll('format').includes(value));

  const maxPriceText = params.get('maxPrice');
  const maxPrice = maxPriceText === null ? NaN : Number(maxPriceText);

  const query: CourseQuery = {
    query: (params.get('q') ?? '').slice(0, MAX_QUERY_LENGTH),
    formats,
    grade,
    duration,
    maxPrice: Number.isFinite(maxPrice) ? maxPrice : null,
    sort,
  };

  const idsText = params.get('ids');
  if (idsText !== null) {
    query.ids = idsText
      .split(',')
      .filter((part) => part !== '')
      .map((part) => Number(part))
      .filter((id) => Number.isSafeInteger(id))
      .slice(0, MAX_IDS);
  }
  return query;
}
