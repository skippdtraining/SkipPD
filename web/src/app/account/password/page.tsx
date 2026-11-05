/**
 * @fileoverview Route for "/account/password": change the password of a
 * signed-in user. Asks for the current password, so a stolen session alone
 * cannot take over the account. Next.js requires a default export.
 */

import type {Metadata} from 'next';
import Link from 'next/link';
import {redirect} from 'next/navigation';
import {Suspense} from 'react';
import {changePasswordAction} from '@/app/actions/auth';
import {AuthForm} from '@/components/AuthForm';
import {AuthShell} from '@/components/AuthShell';
import {MIN_PASSWORD_LENGTH} from '@/config/accounts';
import {SITE_NAME} from '@/config/site';
import {getAuthService} from '@/lib/auth/auth-service';

export const metadata: Metadata = {title: `Change password | ${SITE_NAME}`};

/** Signed-in users only. */
async function ChangePasswordContent() {
  if (!(await getAuthService().getCurrentUser())) {
    redirect('/sign-in?next=/account/password');
  }
  return (
    <>
      <AuthForm action={changePasswordAction} submitLabel="Change password">
        <label className="field">
          Current password
          <input
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            required
          />
        </label>
        <label className="field">
          New password (at least {MIN_PASSWORD_LENGTH} characters)
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            required
          />
        </label>
        <label className="field">
          Confirm new password
          <input
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            required
          />
        </label>
      </AuthForm>
      <p className="auth-links">
        <Link href="/account">← Back to account</Link>
        <Link href="/forgot-password">Forgot it? Signed up with Google?</Link>
      </p>
    </>
  );
}

export default function ChangePasswordPage() {
  return (
    <AuthShell title="Change password">
      <Suspense>
        <ChangePasswordContent />
      </Suspense>
    </AuthShell>
  );
}
