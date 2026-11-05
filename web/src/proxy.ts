/**
 * @fileoverview Next.js proxy (formerly "middleware"): runs before every
 * page request.
 *
 * Its only job is to keep the sign-in session fresh (see
 * lib/auth/auth-service.ts). It does not protect pages: each page and
 * server action checks the user itself, as the Next.js docs advise.
 */

import {NextResponse, type NextRequest} from 'next/server';
import {refreshSession} from '@/lib/auth/auth-service';

export async function proxy(request: NextRequest) {
  return refreshSession(request, () => NextResponse.next({request}));
}

export const config = {
  // Skip static files, images and the catalog API (no session needed there).
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/courses|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)',
  ],
};
