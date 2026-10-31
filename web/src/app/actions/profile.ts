/**
 * @fileoverview Server action that saves the profile form (onboarding and
 * account pages), including the optional certification upload.
 */

'use server';

import {redirect} from 'next/navigation';
import {getAuthService} from '@/lib/auth/auth-service';
import {getProfileRepository} from '@/lib/data/profile-repository';
import {parseProfileForm} from '@/lib/profile-form';

/** What the profile form shows after submitting. */
export interface ProfileFormState {
  error?: string;
}

/** Validates and saves the profile, then opens the account page. */
export async function saveProfileAction(
  _previous: ProfileFormState,
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
  redirect('/account');
}
