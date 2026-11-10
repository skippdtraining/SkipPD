/**
 * @fileoverview {@link ListingRepository} backed by Supabase (Postgres +
 * Storage).
 *
 * Acts as the signed-in trainer, so Row Level Security in
 * `supabase/migrations/0011_listings_owner.sql` decides which rows may be
 * written. Cover images go to the public `listings` bucket, one folder per
 * user id.
 *
 * Server only: called from `app/actions/listings.ts`.
 */

import {getRequestClient} from '@/lib/supabase/clients';
import type {SupabaseClient} from '@supabase/supabase-js';
import type {ListingInput} from '../types';
import type {ListingRepository, TrainerIdentity} from './listing-repository';
import {
  LISTING_COLUMNS,
  loadTrainerBadges,
  toCourse,
  type ListingRow,
} from './listing-row';

/** Bucket that holds listing cover images (public read). */
const IMAGE_BUCKET = 'listings';

/** Default built-in illustration for listings without an uploaded image. */
const DEFAULT_COVER = {cover_color: '#e7dff6', cover_accent: '#8264ad', type: 'books'};

/** Database columns written from the listing form. */
function toColumns(input: ListingInput, trainer: TrainerIdentity) {
  return {
    title: input.title,
    category: input.category,
    trainer_name: trainer.name,
    trainer_role: trainer.credentials,
    format: input.format,
    hours: input.hours,
    price_usd: input.price,
    grades: input.grades,
    description: input.description,
    outcomes: input.outcomes,
    is_published: input.isPublished,
  };
}

/** File extension for the validated image type (see `lib/listing-form.ts`). */
function imageExtension(file: File): string {
  if (file.type === 'image/png') return 'png';
  if (file.type === 'image/webp') return 'webp';
  return 'jpg';
}

/** Uploads the image into the trainer's folder and returns its storage path. */
async function uploadImage(
  client: SupabaseClient,
  userId: string,
  file: File,
): Promise<string> {
  const path = `${userId}/${crypto.randomUUID()}.${imageExtension(file)}`;
  const {error} = await client.storage
    .from(IMAGE_BUCKET)
    .upload(path, file, {contentType: file.type});
  if (error) throw new Error(`Could not upload image: ${error.message}`);
  return path;
}

/**
 * Removes an image after the row that used it changed. Best effort: a
 * leftover file is harmless, so a failure is only logged.
 */
async function removeImage(client: SupabaseClient, path: string): Promise<void> {
  const {error} = await client.storage.from(IMAGE_BUCKET).remove([path]);
  if (error) console.error(`Could not remove listing image ${path}: ${error.message}`);
}

/** Repository for the signed-in trainer's own listings. */
export function createSupabaseListingRepository(): ListingRepository {
  return {
    async listMyListings(userId) {
      const {data, error} = await (
        await getRequestClient()
      )
        .from('listings')
        .select(LISTING_COLUMNS)
        .eq('owner_id', userId)
        .order('created_at', {ascending: false})
        .returns<ListingRow[]>();
      if (error) throw new Error(`Could not load your listings: ${error.message}`);
      const badges = await loadTrainerBadges(data);
      return data.map((row) =>
        toCourse(row, row.owner_id === null ? undefined : badges.get(row.owner_id)),
      );
    },

    async createListing(userId, trainer, input, image) {
      const client = await getRequestClient();
      const imagePath = image ? await uploadImage(client, userId, image) : null;
      const {error} = await client.from('listings').insert({
        ...toColumns(input, trainer),
        ...DEFAULT_COVER,
        owner_id: userId,
        image_path: imagePath,
      });
      if (error) {
        // Do not leave an orphan file behind when the row was rejected.
        if (imagePath) await removeImage(client, imagePath);
        throw new Error(`Could not save listing: ${error.message}`);
      }
    },

    async updateListing(userId, listingId, trainer, input, image) {
      const client = await getRequestClient();
      const {data: current, error: readError} = await client
        .from('listings')
        .select('image_path')
        .eq('id', listingId)
        .eq('owner_id', userId)
        .maybeSingle<{image_path: string | null}>();
      if (readError) throw new Error(`Could not load listing: ${readError.message}`);
      if (!current) throw new Error('This listing no longer exists.');

      const newImagePath = image ? await uploadImage(client, userId, image) : null;
      const {error} = await client
        .from('listings')
        .update({
          ...toColumns(input, trainer),
          image_path: newImagePath ?? current.image_path,
        })
        .eq('id', listingId)
        .eq('owner_id', userId);
      if (error) {
        if (newImagePath) await removeImage(client, newImagePath);
        throw new Error(`Could not save listing: ${error.message}`);
      }

      // The row now points at the new file; drop the replaced one.
      if (newImagePath && current.image_path) {
        await removeImage(client, current.image_path);
      }
    },

    async deleteListing(userId, listingId) {
      const client = await getRequestClient();
      const {data, error} = await client
        .from('listings')
        .delete()
        .eq('id', listingId)
        .eq('owner_id', userId)
        .select('image_path')
        .returns<{image_path: string | null}[]>();
      if (error) throw new Error(`Could not delete listing: ${error.message}`);
      const path = data[0]?.image_path;
      if (path) await removeImage(client, path);
    },
  };
}
