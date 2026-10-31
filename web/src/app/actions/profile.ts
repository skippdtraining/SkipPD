/**
 * @fileoverview Server action that saves the profile form (onboarding and
 * account pages), including the optional certification upload.
 */

'use server';

import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {getAuthService} from '@/lib/auth/auth-service';
import {getProfileRepository} from '@/lib/data/profile-repository';
import {parseProfileForm} from '@/lib/profile-form';

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
  if (!(await getAuthService().getCurrentUser())) redirect('/sign-in');

  const repository = getProfileRepository();
  const existing = await repository.getMyProfile();
  const parsed = parseProfileForm(data, existing?.role ?? null);
  if (!parsed.ok) return {error: parsed.message};

  try {
    await repository.saveMyProfile(parsed.input);
    if (parsed.certification)
      await repository.uploadMyCertification(parsed.certification);
  } catch (error) {
    console.error(error);
    return {error: 'Could not save your profile. Please try again.'};
  }
  if (!existing) redirect('/?welcome=1');
  revalidatePath('/account');
  return {savedCount: (previous.savedCount ?? 0) + 1};
}
