/**
 * @fileoverview Server actions for a trainer's own listings (Step 6):
 * load them into the "My listings" dialog, save a new or edited listing, and
 * delete one.
 *
 * Every action re-checks the signed-in account here (server actions can be
 * called directly) and the database re-checks ownership through Row Level
 * Security (migration 0011).
 */

'use server';

import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {getListingRepository} from '@/lib/data/listing-repository';
import {parseListingForm} from '@/lib/listing-form';
import type {Course, Viewer} from '@/lib/types';
import {getViewer} from '@/lib/viewer';

/** What the listing form shows after submitting. */
export interface ListingFormState {
  error?: string;
  /** Increases after each successful save, so the form can react once per save. */
  savedCount?: number;
}

/** What the delete button shows after submitting. */
export interface DeleteListingState {
  error?: string;
  /** Increases after each successful delete. */
  deletedCount?: number;
}

/** True when the visitor may create and manage listings. */
function canManageListings(viewer: Viewer | null): boolean {
  return !viewer?.isAdmin && viewer?.profile?.role === 'trainer';
}

/**
 * Loads the signed-in trainer's listings (including hidden ones) for the
 * "My listings" dialog. Returns an empty list for anyone else.
 */
export async function listMyListingsAction(): Promise<Course[]> {
  const viewer = await getViewer();
  if (!viewer || !canManageListings(viewer)) return [];
  return getListingRepository().listMyListings(viewer.id);
}

/** Creates a new listing or saves edits to an existing one. */
export async function saveListingAction(
  previous: ListingFormState,
  data: FormData,
): Promise<ListingFormState> {
  const viewer = await getViewer();
  if (!viewer) redirect('/sign-in');
  if (!viewer.profile || !canManageListings(viewer)) {
    return {error: 'Only trainer accounts can list training.'};
  }

  const parsed = parseListingForm(data);
  if (!parsed.ok) return {error: parsed.message};

  const repository = getListingRepository();
  const trainer = {
    name: viewer.profile.fullName,
    credentials: viewer.profile.credentials,
  };

  try {
    if (parsed.listingId === null) {
      await repository.createListing(viewer.id, trainer, parsed.input, parsed.image);
    } else {
      await repository.updateListing(
        viewer.id,
        parsed.listingId,
        trainer,
        parsed.input,
        parsed.image,
      );
    }
  } catch (error) {
    console.error(error);
    return {error: 'Could not save your listing. Please try again.'};
  }

  revalidatePath('/');
  return {savedCount: (previous.savedCount ?? 0) + 1};
}

/** Deletes one of the trainer's listings and its cover image. */
export async function deleteListingAction(
  previous: DeleteListingState,
  data: FormData,
): Promise<DeleteListingState> {
  const viewer = await getViewer();
  if (!viewer) redirect('/sign-in');
  if (!canManageListings(viewer)) {
    return {error: 'Only trainer accounts can manage listings.'};
  }

  const listingId = Number(String(data.get('listingId') ?? ''));
  if (!Number.isInteger(listingId) || listingId <= 0) {
    return {error: 'Could not identify the listing.'};
  }

  try {
    await getListingRepository().deleteListing(viewer.id, listingId);
  } catch (error) {
    console.error(error);
    return {error: 'Could not delete the listing. Please try again.'};
  }

  revalidatePath('/');
  return {deletedCount: (previous.deletedCount ?? 0) + 1};
}
