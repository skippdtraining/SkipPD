/**
 * @fileoverview Shared mapping between `public.listings` rows and the app's
 * {@link Course} type.
 *
 * Why this exists: two repositories read listings — `supabase-course-repository`
 * for the public catalog and `supabase-listing-repository` for a trainer's own
 * listings. Keeping the column list and the row conversion here means a new
 * column is added once. Tables: `supabase/migrations/0001_catalog.sql` and
 * `0011_listings_owner.sql`.
 *
 * Server only: both callers run on the server.
 */

import {getPublicClient} from '@/lib/supabase/clients';
import type {Course, CoverType, Format, Grade, ReviewStatus} from '../types';

/** Columns read from `public.listings`, in database naming. */
export interface ListingRow {
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
  owner_id: string | null;
  image_path: string | null;
  is_published: boolean;
}

/** Column list that matches {@link ListingRow}. */
export const LISTING_COLUMNS =
  'id, title, category, trainer_name, trainer_role, format, hours, price_usd, grades, ' +
  'tags, description, outcomes, cover_color, cover_accent, cover_type, owner_id, ' +
  'image_path, is_published';

/** One row of the public `trainer_badges` view. */
export interface TrainerBadges {
  owner_id: string;
  certification_status: string;
  license_status: string;
}

/** Public URL of an uploaded listing image (the `listings` bucket is public). */
export function listingImageUrl(path: string): string {
  return getPublicClient().storage.from('listings').getPublicUrl(path).data.publicUrl;
}

/**
 * Loads the review badges for the owners of the given rows, keyed by owner
 * id. One query for the whole page of listings.
 */
export async function loadTrainerBadges(
  rows: ListingRow[],
): Promise<Map<string, TrainerBadges>> {
  const ownerIds = [
    ...new Set(rows.map((row) => row.owner_id).filter((id): id is string => id !== null)),
  ];
  if (ownerIds.length === 0) return new Map();

  const {data, error} = await getPublicClient()
    .from('trainer_badges')
    .select('owner_id, certification_status, license_status')
    .in('owner_id', ownerIds)
    .returns<TrainerBadges[]>();
  if (error) throw new Error(`Could not load trainer badges: ${error.message}`);
  return new Map(data.map((badges) => [badges.owner_id, badges]));
}

/**
 * Converts a database row into the app's {@link Course} type. Badge states
 * stay 'none' for seed rows, which have no owner and no profile.
 */
export function toCourse(row: ListingRow, badges: TrainerBadges | undefined): Course {
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
    ownerId: row.owner_id,
    isPublished: row.is_published,
    image: row.image_path ? listingImageUrl(row.image_path) : undefined,
    // Safe: the CHECK constraints on `trainer_profiles` allow only these values.
    certificationStatus: (badges?.certification_status ?? 'none') as ReviewStatus,
    licenseStatus: (badges?.license_status ?? 'none') as ReviewStatus,
  };
}
