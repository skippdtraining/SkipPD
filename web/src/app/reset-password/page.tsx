/**
 * @fileoverview Route for "/reset-password": sets a new password. Reached
 * from the emailed reset link (which signs the user in first) or from the
 * account page. Next.js requires a default export.
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

export const metadata: Metadata = {title: `New password | ${SITE_NAME}`};

/** Only signed-in users can set a new password. */
async function ResetPasswordContent() {
  if (!(await getAuthService().getCurrentUser())) redirect('/sign-in');
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
