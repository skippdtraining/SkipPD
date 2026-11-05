/**
 * @fileoverview Route for "/reset-password": sets a new password after an
 * emailed reset link. Only works with the short-lived pass the link grants
 * (lib/password-reset-pass.ts); signed-in users who want to change their
 * password use "/account/password", which asks for the current one. Next.js requires a default export.
 */

import type {Metadata} from 'next';
import {redirect} from 'next/navigation';
import {Suspense} from 'react';
import {resetPasswordAction} from '@/app/actions/auth';
import {AuthForm} from '@/components/AuthForm';
import {AuthShell} from '@/components/AuthShell';
import {MIN_PASSWORD_LENGTH} from '@/config/accounts';
import {SITE_NAME} from '@/config/site';
import {getAuthService} from '@/lib/auth/auth-service';
import {hasResetPass} from '@/lib/password-reset-pass';

export const metadata: Metadata = {title: `New password | ${SITE_NAME}`};

/** Requires a session and a fresh reset-link pass. */
async function ResetPasswordContent() {
  if (!(await getAuthService().getCurrentUser())) redirect('/sign-in');
  if (!(await hasResetPass())) redirect('/account/password');
  return (
    <AuthForm action={resetPasswordAction} submitLabel="Save new password">
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
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthShell title="Set a new password">
      <Suspense>
        <ResetPasswordContent />
      </Suspense>
    </AuthShell>
  );
}
