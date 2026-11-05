/**
 * @fileoverview Route for "/forgot-password": emails a reset link that
 * leads to "/reset-password". Next.js requires a default export.
 */

import type {Metadata} from 'next';
import Link from 'next/link';
import {forgotPasswordAction} from '@/app/actions/auth';
import {AuthForm} from '@/components/AuthForm';
import {AuthShell} from '@/components/AuthShell';
import {SITE_NAME} from '@/config/site';

export const metadata: Metadata = {title: `Reset password | ${SITE_NAME}`};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      intro="We will email you a link to set a new one."
    >
      <AuthForm action={forgotPasswordAction} submitLabel="Send reset link">
        <label className="field">
          Email
          <input name="email" type="email" autoComplete="email" required />
        </label>
      </AuthForm>
      <p className="auth-links">
        <Link href="/sign-in">Back to sign in</Link>
      </p>
    </AuthShell>
  );
}
