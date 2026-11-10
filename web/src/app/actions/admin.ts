/**
 * @fileoverview Server actions for the admin page: approve or reject a
 * review item. (Certificate files open through GET /admin/file/[userId].)
 *
 * Every action re-checks the admin flag (server actions can be called
 * directly); the database checks it again in `review_profile()`.
 */

'use server';

import {revalidatePath} from 'next/cache';
import {notFound, redirect} from 'next/navigation';
import {MAX_REVIEW_REASON_LENGTH} from '@/config/accounts';
import {getAdminRepository, ReviewConflictError} from '@/lib/data/admin-repository';
import {getEmailService} from '@/lib/email/email-service';
import {buildReviewEmail} from '@/lib/email/review-notification';
import {readText} from '@/lib/form-helpers';
import type {ReviewDecision, ReviewItem} from '@/lib/types';
import {getRequestOrigin} from '@/lib/request-origin';
import {getViewer} from '@/lib/viewer';

const REVIEW_ITEMS: ReviewItem[] = ['certification', 'license', 'school'];

/** What a review card shows after submitting. */
export interface ReviewFormState {
  error?: string;
  success?: string;
}

/** Stops non-admins; returns nothing for admins. */
async function requireAdmin(): Promise<void> {
  const viewer = await getViewer();
  if (!viewer) redirect('/sign-in?next=/admin');
  if (!viewer.isAdmin) notFound();
}

/** Records an approve / reject decision from a review card. */
export async function reviewAction(
  _previous: ReviewFormState,
  data: FormData,
): Promise<ReviewFormState> {
  await requireAdmin();

  const item = REVIEW_ITEMS.find((value) => value === readText(data, 'item'));
  const decisionText = readText(data, 'decision');
  const decision: ReviewDecision | null =
    decisionText === 'approved' || decisionText === 'rejected' ? decisionText : null;
  const reason = readText(data, 'reason');
  if (!item || !decision) return {error: 'Unknown review.'};
  if (decision === 'rejected' && reason === '') {
    return {error: 'Write a short reason so the user knows what to fix.'};
  }
  if (reason.length > MAX_REVIEW_REASON_LENGTH) {
    return {error: `Keep the reason under ${MAX_REVIEW_REASON_LENGTH} characters.`};
  }

  const userId = readText(data, 'userId');
  // Certificates carry the file the admin saw; the database refuses the
  // decision if a newer upload replaced it.
  const expectedPath =
    item === 'certification' ? readText(data, 'certificationPath') : null;

  const repository = getAdminRepository();
  let contact: {fullName: string; email: string} | null = null;
  try {
    contact = await repository.getReviewContact(userId);
  } catch (error) {
    // Notification only: a failed lookup must not block the decision.
    console.error('Review contact lookup failed:', error);
  }

  try {
    await repository.review(
      userId,
      item,
      decision,
      reason,
      expectedPath === '' ? null : expectedPath,
    );
  } catch (error) {
    if (error instanceof ReviewConflictError) {
      return {error: 'This request changed or was already reviewed. Reload the page.'};
    }
    console.error(error);
    return {error: 'Could not save the review. Reload the page and try again.'};
  }

  // Best-effort notice: the decision is already saved, so email errors are
  // logged and the admin still sees "Saved."
  if (contact) {
    try {
      const origin = await getRequestOrigin();
      await getEmailService().send(
        buildReviewEmail({
          to: contact.email,
          fullName: contact.fullName,
          item,
          decision,
          reason,
          accountUrl: `${origin}/account`,
        }),
      );
    } catch (error) {
      console.error('Review notification email failed:', error);
    }
  }

  revalidatePath('/admin');
  return {success: 'Saved.'};
}
