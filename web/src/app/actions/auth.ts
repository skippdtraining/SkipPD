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
import {consumeResetPass, hasResetPass} from '@/lib/password-reset-pass';
import {readText} from '@/lib/form-helpers';
import {getRequestOrigin} from '@/lib/request-origin';
import {getViewer, homeFor, safeNextPath} from '@/lib/viewer';

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

  const viewer = await getViewer();
  const next = safeNextPath(readText(data, 'next'), AFTER_SIGN_IN_PATH);
  redirect(viewer ? homeFor(viewer, next) : '/sign-in');
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

/** Returns an error for a weak or mistyped new password, or null. */
function checkNewPassword(data: FormData): string | null {
  const password = String(data.get('password') ?? '');
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (password !== String(data.get('confirmPassword') ?? '')) {
    return 'Passwords do not match.';
  }
  return null;
}

/** Sets a new password for the user who arrived from a reset link. */
export async function resetPasswordAction(
  _previous: AuthFormState,
  data: FormData,
): Promise<AuthFormState> {
  // Without the pass from a fresh reset link, the current password is
  // required instead (/account/password).
  if (!(await hasResetPass())) {
    return {error: 'This reset link has expired. Please request a new one.'};
  }
  const problem = checkNewPassword(data);
  if (problem) return {error: problem};
  const result = await getAuthService().updatePassword(String(data.get('password')));
  if (!result.ok) return {error: result.message};
  await consumeResetPass();
  redirect('/account');
}

/** Changes the password of a signed-in user who knows the current one. */
export async function changePasswordAction(
  _previous: AuthFormState,
  data: FormData,
): Promise<AuthFormState> {
  const auth = getAuthService();
  const user = await auth.getCurrentUser();
  if (!user) redirect('/sign-in?next=/account/password');

  const problem = checkNewPassword(data);
  if (problem) return {error: problem};
  // Re-checking the current password proves the person at the keyboard
  // owns the account, not just a (possibly stolen) session.
  const check = await auth.signInWithPassword(
    user.email,
    String(data.get('currentPassword') ?? ''),
  );
  if (!check.ok) return {error: 'Your current password is incorrect.'};

  const result = await auth.updatePassword(String(data.get('password')));
  if (!result.ok) return {error: result.message};
  return {notice: 'Your password was changed.'};
}

/** Signs out and returns to the home page. */
export async function signOutAction(): Promise<void> {
  await getAuthService().signOut();
  redirect('/');
}
