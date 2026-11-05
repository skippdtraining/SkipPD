/**
 * @fileoverview Short-lived "password reset pass" cookie.
 *
 * Why: setting a new password without the current one must only be
 * possible right after clicking an emailed reset link. Otherwise anyone
 * holding a stolen session could change the password and take over the
 * account. /auth/callback grants the pass after a valid reset link;
 * /reset-password requires it and removes it once used.
 *
 * Server only. The cookie is httpOnly, so page scripts cannot read or set it.
 */

import {cookies} from 'next/headers';
import type {NextResponse} from 'next/server';

const COOKIE_NAME = 'skippd-password-reset';

/** How long a reset link's pass stays valid: 15 minutes. */
const PASS_MAX_AGE_SECONDS = 15 * 60;

/** Adds the pass to a response (used by the callback route). */
export function grantResetPass(response: NextResponse): void {
  response.cookies.set(COOKIE_NAME, '1', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: PASS_MAX_AGE_SECONDS,
  });
}

/** True when the current request carries a valid pass. */
export async function hasResetPass(): Promise<boolean> {
  return (await cookies()).get(COOKIE_NAME)?.value === '1';
}

/** Removes the pass after the password was changed (server actions only). */
export async function consumeResetPass(): Promise<void> {
  (await cookies()).delete(COOKIE_NAME);
}
