/**
 * @fileoverview Server actions for the admin page: approve or reject a
 * review item, and open a certification file.
 *
 * Every action re-checks the admin flag (server actions can be called
 * directly); the database checks it again in `review_profile()`.
 */

'use server';

import {revalidatePath} from 'next/cache';
import {notFound, redirect} from 'next/navigation';
import {MAX_REVIEW_REASON_LENGTH} from '@/config/accounts';
import {getAdminRepository} from '@/lib/data/admin-repository';
import {readText} from '@/lib/form-helpers';
import type {ReviewDecision, ReviewItem} from '@/lib/types';
import {getViewer} from '@/lib/viewer';

const REVIEW_ITEMS: ReviewItem[] = ['certification', 'license', 'school'];

/** What a review card shows after submitting. */
export interface ReviewFormState {
  error?: string;
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

  try {
    await getAdminRepository().review(readText(data, 'userId'), item, decision, reason);
  } catch (error) {
    console.error(error);
    return {error: 'Could not save the review. Reload the page and try again.'};
  }
  revalidatePath('/admin');
  return {};
}

/** Opens a trainer's certification file in a short-lived link. */
export async function openCertificationAction(data: FormData): Promise<void> {
  await requireAdmin();
  const url = await getAdminRepository().getCertificationUrl(readText(data, 'userId'));
  if (!url) redirect('/admin?file=missing');
  redirect(url);
}
