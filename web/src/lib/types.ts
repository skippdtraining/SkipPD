/**
 * @fileoverview Shared data types and fixed option lists for the whole app.
 *
 * Every component and helper imports its types from here, so there is one
 * source of truth for what a "course" or a "booking request" looks like.
 * Database rows are converted into these shapes in lib/data/, so database
 * column names never reach components.
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
 * Value of the listing-form option that reveals the custom topic field.
 * The suggested topics themselves come from the `categories` database table.
 * Because trainers can type their own topic, a course's topic is free text
 * (see {@link Course.category}) and there is no topic filter.
 */
export const OTHER_CATEGORY = 'Other';

/** Which built-in illustration to draw when a listing has no uploaded image. */
export type CoverType =
  'books' | 'tech' | 'language' | 'classroom' | 'inclusive' | 'leadership';

/** A training listing shown in the catalog. */
export interface Course {
  /** Unique id. Database listings use small numbers; browser-created listings use a timestamp. */
  id: number;
  title: string;
  /** Topic: a suggested category or a custom one typed by the trainer. */
  category: string;
  /** Trainer display name. Becomes a link to the trainer's profile in Step 4. */
  trainer: string;
  /** Trainer credentials line; comes from the trainer's profile from Step 4. Empty if unknown. */
  role: string;
  format: Format;
  /** Session length in hours. */
  hours: number;
  /** Price per participant, in USD. */
  price: number;
  grades: Grade[];
  /** Search keywords. Not entered in the listing form; set in the database. */
  tags: string[];
  description: string;
  /** "What you'll take away" bullet points. */
  outcomes: string[];
  /** Cover background colour (hex), used by the illustration. */
  color: string;
  /** Cover accent colour (hex), used by the illustration. */
  accent: string;
  type: CoverType;
  /** Optional uploaded cover image as a data URL. Moves to file storage in Step 5. */
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

/**
 * What the catalog asks the course repository for. Same as
 * {@link CatalogFilters}, except the browser-only "Saved" tab becomes a list
 * of course ids, because the server cannot see the browser's saved list.
 */
export interface CourseQuery extends Omit<CatalogFilters, 'savedOnly'> {
  /** When set, only these course ids are returned (used by the Saved tab). */
  ids?: number[];
}

/** Filter state when the page first loads or after "Clear all". */
export const DEFAULT_FILTERS: CatalogFilters = {
  query: '',
  formats: [],
  grade: '',
  duration: '',
  maxPrice: null,
  sort: 'recommended',
  savedOnly: false,
};
