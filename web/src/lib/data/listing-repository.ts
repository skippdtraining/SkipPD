/**
 * @fileoverview Data-access contract for a trainer's own listings (Step 6).
 *
 * Why this exists: components and server actions must not talk to a specific
 * database directly. They call the {@link ListingRepository} interface, and
 * {@link getListingRepository} picks the implementation. The public catalog
 * keeps its own read-only contract in `course-repository.ts`.
 *
 * Current backend: Supabase (see supabase-listing-repository.ts).
 */

import type {Course, ListingInput} from '../types';
import {createSupabaseListingRepository} from './supabase-listing-repository';

/** The owner lines copied from a trainer's profile onto their listings. */
export interface TrainerIdentity {
  /** Full name from the profile (locked after sign-up). */
  name: string;
  /** Credentials line from the profile; empty when the trainer left it blank. */
  credentials: string;
}

/** Everything the app can do with the signed-in trainer's listings. */
export interface ListingRepository {
  /** The trainer's own listings, newest first, including hidden ones. */
  listMyListings(userId: string): Promise<Course[]>;

  /** Creates a listing owned by the trainer, uploading the optional cover image. */
  createListing(
    userId: string,
    trainer: TrainerIdentity,
    input: ListingInput,
    image: File | null,
  ): Promise<void>;

  /** Saves edits to one of the trainer's listings; a new image replaces the old. */
  updateListing(
    userId: string,
    listingId: number,
    trainer: TrainerIdentity,
    input: ListingInput,
    image: File | null,
  ): Promise<void>;

  /** Deletes a listing and its uploaded image. */
  deleteListing(userId: string, listingId: number): Promise<void>;
}

/**
 * Returns the repository the app should use.
 * The single place to change when the backend changes.
 */
export function getListingRepository(): ListingRepository {
  return createSupabaseListingRepository();
}
