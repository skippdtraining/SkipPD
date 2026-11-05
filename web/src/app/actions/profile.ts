/**
 * @fileoverview Server action that saves the profile form (onboarding and
 * account pages), including the optional certification upload.
 */

'use server';

import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {getAuthService} from '@/lib/auth/auth-service';
import {getViewer} from '@/lib/viewer';
import {getProfileRepository} from '@/lib/data/profile-repository';
import {parseProfileForm} from '@/lib/profile-form';
import {keepLockedFields} from '@/lib/profile-locks';

/** What the profile form shows after submitting. */
export interface ProfileFormState {
  error?: string;
  /** Increases on every successful edit, so the form can react to each save. */
  savedCount?: number;
}

/**
 * Validates and saves the profile. A new profile (onboarding) goes to the
 * home page; an edit returns to the account page's summary view.
 */
export async function saveProfileAction(
  previous: ProfileFormState,
  data: FormData,
): Promise<ProfileFormState> {
  // Server actions can be called directly, so check the session here too.
  const viewer = await getViewer();
  if (!viewer) redirect('/sign-in');

  const repository = getProfileRepository();
  const existing = viewer.profile;
  const parsed = parseProfileForm(data, existing?.role ?? null);
  if (!parsed.ok) return {error: parsed.message};

  try {
    // Ignore changes to locked fields, even if the form was tampered with.
    await repository.saveMyProfile(viewer.id, keepLockedFields(parsed.input, existing));
  } catch (error) {
    console.error(error);
    return {error: 'Could not save your profile. Please try again.'};
  }

  // The profile is saved either way; a failed upload only needs a retry.
  let uploadFailed = false;
  if (parsed.certification) {
    try {
      await repository.uploadMyCertification(viewer.id, parsed.certification);
    } catch (error) {
      console.error(error);
      uploadFailed = true;
    }
  }

  if (!existing) redirect(uploadFailed ? '/account?upload=failed' : '/?welcome=1');
  if (uploadFailed) {
    return {
      error: 'Your profile was saved, but the file could not be uploaded. Try again.',
    };
  }
  revalidatePath('/account');
  return {savedCount: (previous.savedCount ?? 0) + 1};
}

/** What the delete-account form shows after submitting. */
export interface DeleteAccountState {
  error?: string;
}

/** Word the user must type to confirm deletion. */
const DELETE_CONFIRMATION = 'DELETE';

/** Permanently deletes the signed-in user's account, then goes home. */
export async function deleteAccountAction(
  _previous: DeleteAccountState,
  data: FormData,
): Promise<DeleteAccountState> {
  const viewer = await getViewer();
  if (!viewer) redirect('/sign-in');
  if (String(data.get('confirm') ?? '').trim() !== DELETE_CONFIRMATION) {
    return {error: `Type ${DELETE_CONFIRMATION} to confirm.`};
  }
  try {
    await getProfileRepository().deleteMyAccount(viewer.id);
  } catch (error) {
    console.error(error);
    return {error: 'Could not delete your account. Please try again.'};
  }
  // The account is gone; clear the leftover session cookie.
  await getAuthService().signOut();
  redirect('/?deleted=1');
}
