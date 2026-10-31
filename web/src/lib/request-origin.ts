/**
 * @fileoverview Returns the site address of the current request, e.g.
 * "https://skippd.vercel.app" or "http://localhost:3000".
 *
 * Why: emails and Google sign-in must send users back to the same site
 * they started on (production, a Vercel preview or localhost), so the
 * return links are built from the request instead of a fixed setting.
 *
 * Server only.
 */

import {headers} from 'next/headers';

/** Origin of the current request (scheme + host, no trailing slash). */
export async function getRequestOrigin(): Promise<string> {
  const requestHeaders = await headers();
  const origin = requestHeaders.get('origin');
  if (origin) return origin;
  const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host');
  const protocol = requestHeaders.get('x-forwarded-proto') ?? 'https';
  return `${protocol}://${host}`;
}
