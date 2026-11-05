/**
 * @fileoverview Returns the site address that email links and Google
 * sign-in should send users back to, e.g. "https://skippd.vercel.app".
 *
 * Why: users should return to the site they started on (production, a
 * Vercel preview or localhost). The request headers say which one, but
 * headers can be forged, and a forged address in a password-reset email
 * would hand the reset link to an attacker. So the address from the
 * headers is used only if it is on the allow-list; otherwise the
 * production address is used.
 *
 * Server only.
 */

import {headers} from 'next/headers';
import {ALLOWED_ORIGIN_PATTERNS} from '@/config/site';

/**
 * Production address. `SITE_URL` overrides it if set; otherwise Vercel's
 * built-in `VERCEL_PROJECT_PRODUCTION_URL` (host only) is used. Falls back
 * to localhost for local development.
 */
function productionOrigin(): string {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, '');
  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return vercelHost ? `https://${vercelHost}` : 'http://localhost:3000';
}

/** True when `origin` is production or matches an allowed pattern. */
function isAllowedOrigin(origin: string): boolean {
  return (
    origin === productionOrigin() ||
    ALLOWED_ORIGIN_PATTERNS.some((pattern) => pattern.test(origin))
  );
}

/** Safe origin of the current request (scheme + host, no trailing slash). */
export async function getRequestOrigin(): Promise<string> {
  const requestHeaders = await headers();
  const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host');
  const protocol = requestHeaders.get('x-forwarded-proto') ?? 'https';
  const candidate = requestHeaders.get('origin') ?? `${protocol}://${host}`;
  return isAllowedOrigin(candidate) ? candidate : productionOrigin();
}
