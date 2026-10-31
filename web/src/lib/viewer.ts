/**
 * @fileoverview Looks up the visitor of the current request: guest, signed
 * in without a profile, or signed in with a profile.
 *
 * Why this exists: pages need the session (lib/auth) and the profile
 * (lib/data) together. This combines both behind one call.
 *
 * Server only.
 */

import {getAuthService} from './auth/auth-service';
import {getProfileRepository} from './data/profile-repository';
import type {Viewer} from './types';

/** The signed-in visitor with their profile, or null for guests. */
export async function getViewer(): Promise<Viewer | null> {
  const user = await getAuthService().getCurrentUser();
  if (!user) return null;
  const profile = await getProfileRepository().getMyProfile();
  return {email: user.email, profile};
}

/**
 * Accepts only same-site paths like "/account", so a crafted link cannot
 * send users to another website after sign-in.
 */
export function safeNextPath(path: string | null | undefined, fallback: string): string {
  if (!path || !path.startsWith('/') || path.startsWith('//') || path.includes('\\')) {
    return fallback;
  }
  return path;
}
