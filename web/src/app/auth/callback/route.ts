/**
 * @fileoverview Route for `GET /auth/callback`: where email confirmation
 * links, password-reset links and Google sign-in return to.
 *
 * It accepts either a `token_hash` (email links, works in any browser) or a
 * one-time `code` (Google), creates the session cookie, then sends the user
 * to `next`, or to `/onboarding` if they have no profile yet.
 *
 * A failed email link usually means the email was already confirmed (links
 * work once, and some mail apps open links before the user does), so the
 * user is asked to sign in rather than told something went wrong.
 */

import {NextResponse, type NextRequest} from 'next/server';
import {AFTER_SIGN_IN_PATH} from '@/config/accounts';
import {getAuthService, type EmailLinkType} from '@/lib/auth/auth-service';
import {getProfileRepository} from '@/lib/data/profile-repository';
import {safeNextPath} from '@/lib/viewer';

export async function GET(request: NextRequest) {
  const {searchParams, origin} = request.nextUrl;
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const typeParam = searchParams.get('type');
  const type: EmailLinkType = typeParam === 'recovery' ? 'recovery' : 'email';
  const next = safeNextPath(searchParams.get('next'), AFTER_SIGN_IN_PATH);

  const auth = getAuthService();
  const result = tokenHash
    ? await auth.verifyEmailToken(tokenHash, type)
    : code
      ? await auth.completeSignIn(code)
      : {ok: false as const, message: 'Missing code'};
  if (!result.ok) {
    const reason = type === 'recovery' ? 'link' : 'confirmed';
    return NextResponse.redirect(`${origin}/sign-in?error=${reason}`);
  }

  // The reset-password page works without a profile; everything else needs one.
  const profile = await getProfileRepository().getMyProfile();
  const destination = profile || next === '/reset-password' ? next : '/onboarding';
  return NextResponse.redirect(`${origin}${destination}`);
}
