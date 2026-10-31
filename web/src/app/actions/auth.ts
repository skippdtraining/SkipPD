/**
 * @fileoverview Server actions for sign-in, sign-up, Google, password reset
 * and sign-out. Forms on the auth pages call these.
 *
 * They only talk to the auth vendor through lib/auth, and send users on to
 * `/onboarding` when they have no profile yet.
 */

'use server';

import {redirect} from 'next/navigation';
import {AFTER_SIGN_IN_PATH, MIN_PASSWORD_LENGTH} from '@/config/accounts';
import {getAuthService} from '@/lib/auth/auth-service';
import {getProfileRepository} from '@/lib/data/profile-repository';
import {readText} from '@/lib/form-helpers';
import {getRequestOrigin} from '@/lib/request-origin';
import {safeNextPath} from '@/lib/viewer';

/** What an auth form shows after submitting: an error or a success note. */
export interface AuthFormState {
  error?: string;
  notice?: string;
}

/** Callback URL that finishes email links and Google sign-in. */
async function callbackUrl(next: string): Promise<string> {
  return `${await getRequestOrigin()}/auth/callback?next=${encodeURIComponent(next)}`;
}

/** Signs in with email + password, then goes to `next` (or onboarding). */
export async function signInAction(
  _previous: AuthFormState,
  data: FormData,
): Promise<AuthFormState> {
  const result = await getAuthService().signInWithPassword(
    readText(data, 'email'),
    String(data.get('password') ?? ''),
  );
  if (!result.ok) return {error: result.message};

  const profile = await getProfileRepository().getMyProfile();
  redirect(
    profile ? safeNextPath(readText(data, 'next'), AFTER_SIGN_IN_PATH) : '/onboarding',
  );
}

/** Creates an account; the user must click the emailed link to continue. */
export async function signUpAction(
  _previous: AuthFormState,
  data: FormData,
): Promise<AuthFormState> {
  const password = String(data.get('password') ?? '');
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`};
  }
  if (password !== String(data.get('confirmPassword') ?? '')) {
    return {error: 'Passwords do not match.'};
  }
  const result = await getAuthService().signUpWithPassword(
    readText(data, 'email'),
    password,
    await callbackUrl('/onboarding'),
  );
  if (!result.ok) return {error: result.message};
  return {notice: 'Check your email and click the link to confirm your account.'};
}

/** Sends the user to Google; Google returns them to /auth/callback. */
export async function googleSignInAction(data: FormData): Promise<void> {
  const next = safeNextPath(readText(data, 'next'), AFTER_SIGN_IN_PATH);
  redirect(await getAuthService().getGoogleSignInUrl(await callbackUrl(next)));
}

/** Emails a password-reset link. Always reports success, so emails cannot be probed. */
export async function forgotPasswordAction(
  _previous: AuthFormState,
  data: FormData,
): Promise<AuthFormState> {
  await getAuthService().sendPasswordReset(
    readText(data, 'email'),
    await callbackUrl('/reset-password'),
  );
  return {notice: 'If an account exists for this email, a reset link is on its way.'};
}

/** Sets a new password for the user who arrived from a reset link. */
export async function resetPasswordAction(
  _previous: AuthFormState,
  data: FormData,
): Promise<AuthFormState> {
  const password = String(data.get('password') ?? '');
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`};
  }
  if (password !== String(data.get('confirmPassword') ?? '')) {
    return {error: 'Passwords do not match.'};
  }
  const result = await getAuthService().updatePassword(password);
  if (!result.ok) return {error: result.message};
  redirect('/account');
}

/** Signs out and returns to the home page. */
export async function signOutAction(): Promise<void> {
  await getAuthService().signOut();
  redirect('/');
}
