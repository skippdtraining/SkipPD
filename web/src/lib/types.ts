/**
 * @fileoverview Shared data types and fixed option lists for the whole app.
 *
 * Every component and helper imports its types from here, so there is one
 * source of truth for what a "course" or a "booking request" looks like.
 * In Step 2 these shapes will mirror the Supabase database tables.
 */

/**
 * How a training is delivered.
 * "Self-paced" exists in the POC but is deferred (SkipPD_v2.md, section 3).
 */
export type Format = 'Live online' | 'In person';

/** US grade bands used for filtering. */
export type Grade = 'K–5' | '6–8' | '9–12';

/** All grade bands, in display order. */
export const GRADES: Grade[] = ['K–5', '6–8', '9–12'];

/** All delivery formats, in display order. */
export const FORMATS: Format[] = ['Live online', 'In person'];

/**
 * Training topics. Declared `as const` so TypeScript can derive the
 * {@link Category} type from this list instead of repeating the values.
 */
export const CATEGORIES = [
  'Literacy',
  'EdTech & AI',
  'ESL & ELL',
  'Special education',
  'Classroom management',
  'Leadership',
] as const;

/** One of the values in {@link CATEGORIES}. */
export type Category = (typeof CATEGORIES)[number];

/** Which built-in illustration to draw when a listing has no uploaded image. */
export type CoverType =
  'books' | 'tech' | 'language' | 'classroom' | 'inclusive' | 'leadership';

/** A training listing shown in the catalog. */
export interface Course {
  /** Unique id. Sample data uses 1-6; browser-created listings use a timestamp. */
  id: number;
  title: string;
  category: Category;
  /** Trainer display name. Becomes a link to the trainer's profile in Step 3. */
  trainer: string;
  /** Trainer experience / credentials line, e.g. "Literacy coach · 12 years". */
  role: string;
  format: Format;
  /** Session length in hours. */
  hours: number;
  /** Price per participant, in USD. */
  price: number;
  grades: Grade[];
  /** Search keywords, max 5. */
  tags: string[];
  description: string;
  /** "What you'll take away" bullet points. */
  outcomes: string[];
  /** Cover background colour (hex), used by the illustration. */
  color: string;
  /** Cover accent colour (hex), used by the illustration. */
  accent: string;
  type: CoverType;
  /** Optional uploaded cover image as a data URL. Moves to file storage in Step 4. */
  image?: string;
}

/** A booking request a teacher or school sends for a course. */
export interface BookingRequest {
  /** Unique id (creation timestamp). */
  id: number;
  courseId: number;
  /** Course title, copied so the request still reads well if the course changes. */
  course: string;
  /** Trainer name, copied for the same reason as `course`. */
  trainer: string;
  name: string;
  email: string;
  /** Who the booking is for: "Myself", "School / district team" or "Teacher group". */
  audience: string;
  participants: number;
  school: string;
  /** Preferred session date, ISO format `YYYY-MM-DD`. */
  date: string;
  message: string;
}

/** Current state of every search / filter / sort control on the catalog. */
export interface CatalogFilters {
  /** Free-text search over title, category, trainer and tags. */
  query: string;
  category: Category | 'All topics';
  /** Selected formats; empty means "any format". */
  formats: Format[];
  /** Selected grade band; empty string means "all grades". */
  grade: Grade | '';
  /** "short" = up to 2 hours, "long" = more than 2 hours. */
  duration: '' | 'short' | 'long';
  /** Show only courses priced below this value; null means "any price". */
  maxPrice: number | null;
  sort: 'recommended' | 'low' | 'high' | 'duration';
  /** True when the "Saved" tab is active. */
  savedOnly: boolean;
}

/** Filter state when the page first loads or after "Clear all". */
export const DEFAULT_FILTERS: CatalogFilters = {
  query: '',
  category: 'All topics',
  formats: [],
  grade: '',
  duration: '',
  maxPrice: null,
  sort: 'recommended',
  savedOnly: false,
};
