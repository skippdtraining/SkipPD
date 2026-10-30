/**
 * @fileoverview Catalog settings: filter options, thresholds and limits.
 *
 * Why this exists: these values are business choices (which price brackets
 * to offer, what counts as a "short" course, upload limits). They used to be
 * hard-coded inside components; here they can change without touching UI or
 * filtering code.
 */

/** Courses up to this many hours count as "short" in the duration filter. */
export const SHORT_COURSE_MAX_HOURS = 2;

/** "Under $X" options in the price filter, in USD. */
export const PRICE_FILTER_OPTIONS = [75, 150, 300];

/** Largest accepted cover image: 1 MB. */
export const MAX_IMAGE_BYTES = 1024 * 1024;

/** Accepted cover image types. */
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/** Longest custom topic a trainer can type when choosing "Other". */
export const MAX_CUSTOM_TOPIC_LENGTH = 40;

/** Course cards shown per catalog page; arrows move between pages. */
export const COURSES_PER_PAGE = 6;

/**
 * What happens when the user changes catalog page:
 * - 'catalog-top': scroll so the line between the search area and the
 *   catalog sits just under the header;
 * - 'none': stay where you are.
 */
export const PAGE_CHANGE_SCROLL: 'catalog-top' | 'none' = 'catalog-top';

/** Most learning outcomes a listing can have. */
export const MAX_OUTCOMES = 8;

/** Longest single learning outcome, in characters. */
export const MAX_OUTCOME_LENGTH = 150;
