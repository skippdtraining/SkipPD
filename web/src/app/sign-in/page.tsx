/**
 * @fileoverview Route for "/sign-in": email + password or Google.
 *
 * `?next=/path` returns the user to that page afterwards. `?error=confirmed`
 * follows a sign-up link that was already used (the email is confirmed);
 * `?error=link` follows a password-reset link that expired. Next.js requires a default export.
 */

import type {Metadata} from 'next';
import Link from 'next/link';
import {Suspense} from 'react';
import {signInAction} from '@/app/actions/auth';
import {AuthForm} from '@/components/AuthForm';
import {AuthShell} from '@/components/AuthShell';
import {GoogleSignInButton} from '@/components/GoogleSignInButton';
import {AFTER_SIGN_IN_PATH} from '@/config/accounts';
import {SITE_NAME} from '@/config/site';
import {safeNextPath} from '@/lib/viewer';

export const metadata: Metadata = {title: `Sign in | ${SITE_NAME}`};

/** Reads the URL params (request-time data, so it sits inside Suspense). */
async function SignInContent({searchParams}: PageProps<'/sign-in'>) {
  const params = await searchParams;
  const next = safeNextPath(
    typeof params.next === 'string' ? params.next : null,
    AFTER_SIGN_IN_PATH,
  );
  return (
    <>
      {params.error === 'confirmed' && (
        <p className="notice" role="status">
          Your email is confirmed. Please sign in to continue.
        </p>
      )}
      {params.error === 'link' && (
        <p className="form-error" role="alert">
          That link has expired or was already used. Please sign in or request a new one.
        </p>
      )}
      <GoogleSignInButton next={next} />
      <AuthForm action={signInAction} submitLabel="Sign in">
        <input type="hidden" name="next" value={next} />
        <label className="field">
          Email
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label className="field">
          Password
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </label>
      </AuthForm>
      <p className="auth-links">
        <Link href="/forgot-password">Forgot password?</Link>
        <span>
          New here? <Link href="/sign-up">Create an account</Link>
        </span>
      </p>
    </>
  );
}

export default function SignInPage(props: PageProps<'/sign-in'>) {
  return (
    <AuthShell title="Sign in">
      <Suspense>
        <SignInContent {...props} />
      </Suspense>
    </AuthShell>
  );
}
