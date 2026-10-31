/**
 * @fileoverview Account settings: sign-up rules, profile field limits and
 * certification upload limits.
 *
 * Why this exists: these are business choices that may change. The database
 * enforces the same limits (supabase/migrations/0002_accounts.sql); keep
 * both in sync when changing one.
 */

/** Shortest password accepted at sign-up. Match Supabase → Auth → Providers → Email. */
export const MIN_PASSWORD_LENGTH = 8;

/** Largest accepted certification file: 4 MB (Vercel caps uploads at 4.5 MB). */
export const MAX_CERTIFICATION_BYTES = 4 * 1024 * 1024;

/** Accepted certification file types. */
export const CERTIFICATION_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

/** Longest value per profile field, in characters. */
export const PROFILE_LIMITS = {
  fullName: 100,
  credentials: 150,
  employer: 150,
  bio: 2000,
  schoolName: 150,
  contactPosition: 100,
} as const;

/** Where users land after signing in when no other page was requested. */
export const AFTER_SIGN_IN_PATH = '/';
