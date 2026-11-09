/**
 * @fileoverview Data-access contract for the admin review queue.
 *
 * Same pattern as the other repositories: the admin page and its server
 * actions use this interface; the backend enforces that only admins can
 * read the queue or record a decision.
 *
 * Server only.
 */

import type {ReviewDecision, ReviewItem, ReviewRequest} from '../types';
import {createSupabaseAdminRepository} from './supabase-admin-repository';

/** Everything the admin page can ask or do. */
export interface AdminRepository {
  /** True when the account `userId` is an admin. */
  isAdmin(userId: string): Promise<boolean>;
  /** Items waiting for review, oldest first. */
  listPendingReviews(): Promise<ReviewRequest[]>;
  /**
   * Approves or rejects one item. `reason` is shown to the user on their
   * account page when rejecting; it is cleared when approving.
   */
  review(
    userId: string,
    item: ReviewItem,
    decision: ReviewDecision,
    reason: string,
  ): Promise<void>;
  /** Short-lived link to view a trainer's current certification file, or null. */
  getCertificationUrl(userId: string): Promise<string | null>;
}

/** Returns the repository the app should use. */
export function getAdminRepository(): AdminRepository {
  return createSupabaseAdminRepository();
}
