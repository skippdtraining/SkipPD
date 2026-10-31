/**
 * @fileoverview Route for `GET /auth/callback`: where email confirmation
 * links, password-reset links and Google sign-in return to.
 *
 * It swaps the one-time `code` for a session cookie, then sends the user to
 * `next`, or to `/onboarding` if they have no profile yet.
 */

import {NextResponse, type NextRequest} from 'next/server';
import {AFTER_SIGN_IN_PATH} from '@/config/accounts';
import {getAuthService} from '@/lib/auth/auth-service';
import {getProfileRepository} from '@/lib/data/profile-repository';
import {safeNextPath} from '@/lib/viewer';

export async function GET(request: NextRequest) {
  const {searchParams, origin} = request.nextUrl;
  const code = searchParams.get('code');
  const next = safeNextPath(searchParams.get('next'), AFTER_SIGN_IN_PATH);

  const result = code
    ? await getAuthService().completeSignIn(code)
    : {ok: false as const, message: 'Missing code'};
  if (!result.ok) {
    return NextResponse.redirect(`${origin}/sign-in?error=link`);
  }

  // The reset-password page works without a profile; everything else needs one.
  const profile = await getProfileRepository().getMyProfile();
  const destination = profile || next === '/reset-password' ? next : '/onboarding';
  return NextResponse.redirect(`${origin}${destination}`);
}
