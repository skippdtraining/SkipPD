/**
 * @fileoverview Looks up the visitor of the current request: guest, signed
 * in without a profile, or signed in with a profile.
 *
 * Why this exists: pages need the session (lib/auth) and the profile
 * (lib/data) together. This combines both behind one call.
 *
 * Server only.
 */

import {cache} from 'react';
import {getAuthService} from './auth/auth-service';
import {getProfileRepository} from './data/profile-repository';
import type {Viewer} from './types';

/**
 * The signed-in visitor with their profile, or null for guests.
 * `cache` runs the lookup once per request, however many callers ask.
 */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  const user = await getAuthService().getCurrentUser();
  if (!user) return null;
  const profile = await getProfileRepository().getMyProfile(user.id);
  return {id: user.id, email: user.email, profile};
});

/**
 * Accepts only same-site paths like "/account", so a crafted link cannot
 * send users to another website after sign-in.
 */
export function safeNextPath(path: string | null | undefined, fallback: string): string {
  // Control characters are rejected outright: browsers drop tabs and
  // newlines from URLs, which can turn "/\t/evil.com" into "//evil.com".
  if (!path || !path.startsWith('/') || /[\u0000-\u001f\u007f\\]/.test(path)) {
    return fallback;
  }
  // Resolve against a placeholder origin: anything that leaves it
  // (e.g. "//evil.com") is another site.
  const base = 'https://same-site.invalid';
  const url = new URL(path, base);
  if (url.origin !== base) return fallback;
  return `${url.pathname}${url.search}${url.hash}`;
}
