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

/** Listings keep at most this many search keywords. */
export const MAX_LISTING_TAGS = 5;

/** Largest accepted cover image: 1 MB. */
export const MAX_IMAGE_BYTES = 1024 * 1024;

/** Accepted cover image types. */
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/** Longest custom topic a trainer can type when choosing "Other". */
export const MAX_CUSTOM_TOPIC_LENGTH = 40;

/** Course cards shown per catalog page; arrows move between pages. */
export const COURSES_PER_PAGE = 6;
