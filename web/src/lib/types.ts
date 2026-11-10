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
  /** Unique id (database id). */
  id: number;
  title: string;
  /** Topic: a suggested category or a custom one typed by the trainer. */
  category: string;
  /** Trainer display name, copied from the owner's profile when the listing is saved. */
  trainer: string;
  /** Trainer credentials line, copied from the owner's profile. Empty if unknown. */
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
  /** Uploaded cover image (public storage URL). Undefined uses the illustration. */
  image?: string;
  /** Account id of the trainer who owns the listing; null for seed samples. */
  ownerId: string | null;
  /** False when the trainer hid the listing from the catalog. */
  isPublished: boolean;
  /** Owner's PD certificate review state. Badges are hidden for seed rows. */
  certificationStatus: ReviewStatus;
  /** Owner's teaching license review state. Badges are hidden for seed rows. */
  licenseStatus: ReviewStatus;
}

/**
 * Fields a trainer writes when creating or editing a listing.
 * The trainer name and credentials are copied from the profile instead.
 */
export interface ListingInput {
  title: string;
  /** Suggested topic, or a free-text topic when "Other" was chosen. */
  category: string;
  format: Format;
  hours: number;
  price: number;
  grades: Grade[];
  description: string;
  outcomes: string[];
  /** Unchecked hides the listing from the catalog without deleting it. */
  isPublished: boolean;
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
}

/** What the catalog asks the course repository for: the catalog filters. */
export type CourseQuery = CatalogFilters;

/** Filter state when the page first loads or after "Clear all". */
export const DEFAULT_FILTERS: CatalogFilters = {
  query: '',
  formats: [],
  grade: '',
  duration: '',
  maxPrice: null,
  sort: 'recommended',
};

/** Account type, chosen once at sign-up. Trainers can also book PD. */
export type AccountRole = 'trainer' | 'school';

/** Account types with their sign-up labels, in display order. */
export const ACCOUNT_ROLES: {value: AccountRole; label: string; hint: string}[] = [
  {value: 'trainer', label: 'Trainer', hint: 'I teach PD (and may book PD too).'},
  {value: 'school', label: 'School', hint: 'I book PD for my school or district.'},
];

/**
 * Admin review state of a certification or a school account.
 * 'none' means nothing to review (no certification uploaded).
 */
export type ReviewStatus = 'none' | 'pending' | 'approved' | 'rejected';

/** Profile fields a user fills in and may edit later. */
export interface ProfileInput {
  role: AccountRole;
  fullName: string;
  /** Trainer: credentials line shown on their courses, e.g. "Literacy coach · 14 years". */
  credentials: string;
  /** Trainer: currently employed? Null for schools. */
  isEmployed: boolean | null;
  /** Trainer: current place of employment; empty when not employed. */
  employer: string;
  /** Trainer: general description about themselves. */
  bio: string;
  /** Trainer: two-letter US state that issued their teaching license; empty if none. */
  licenseState: string;
  /** Trainer: teaching license number; empty if none. */
  licenseNumber: string;
  /** School: name of the school or district. */
  schoolName: string;
  /** School: the contact person's position, e.g. "Principal". */
  contactPosition: string;
}

/** A user's profile as stored, including fields only the admin can change. */
export interface Profile extends ProfileInput {
  email: string;
  /** True once a certification file was uploaded. */
  hasCertification: boolean;
  /** Trainer: "Certified" only when this is 'approved'. */
  certificationStatus: ReviewStatus;
  /** Trainer: "Licensed" only when this is 'approved'. */
  licenseStatus: ReviewStatus;
  /** School: the email looks like a school address (hint for the admin). */
  isLikelySchoolEmail: boolean;
  /** School: admin approval of the account. */
  schoolStatus: ReviewStatus;
  /**
   * True once the trainer certificate or school was ever approved. Locks the
   * name for good, even if a new certificate sends the review back to pending.
   */
  wasEverApproved: boolean;
  /** Admin's note when the certificate was rejected; empty otherwise. */
  certificationReason: string;
  /** Admin's note when the license was rejected; empty otherwise. */
  licenseReason: string;
  /** Admin's note when the school was rejected; empty otherwise. */
  schoolReason: string;
}

/** The signed-in visitor, or null for guests. */
export interface Viewer {
  /** Account id (from the auth service). */
  id: string;
  email: string;
  /** Null until the user finished the profile form (/onboarding); always null for admins. */
  profile: Profile | null;
  /** Admin accounts review profiles at /admin and never get a profile. */
  isAdmin: boolean;
}

/** What an admin reviews: a trainer's certificate or license, or a school. */
export type ReviewItem = 'certification' | 'license' | 'school';

/** An admin's decision on a review item. */
export type ReviewDecision = 'approved' | 'rejected';

/** One entry in the admin review queue. */
export interface ReviewRequest {
  userId: string;
  item: ReviewItem;
  fullName: string;
  email: string;
  /** Trainer credentials line, or the school's name. */
  headline: string;
  /** Extra lines for the admin, e.g. employer, license, position. */
  details: string[];
  /** School only: email looks like a school address. */
  isLikelySchoolEmail: boolean;
  /** When this item entered review (ISO date-time); oldest first. */
  submittedAt: string;
  /**
   * Certificates only: the file the admin sees. Sent back with the decision,
   * so a newer upload is never approved unseen.
   */
  certificationPath: string | null;
}
