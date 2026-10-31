/**
 * @fileoverview Route for "/sign-up": create an account with email +
 * password (confirmed by email) or Google. The account type and profile
 * are filled in afterwards on "/onboarding". Next.js requires a default
 * export.
 */

import type {Metadata} from 'next';
import Link from 'next/link';
import {signUpAction} from '@/app/actions/auth';
import {AuthForm} from '@/components/AuthForm';
import {AuthShell} from '@/components/AuthShell';
import {GoogleSignInButton} from '@/components/GoogleSignInButton';
import {MIN_PASSWORD_LENGTH} from '@/config/accounts';
import {SITE_NAME} from '@/config/site';

export const metadata: Metadata = {title: `Create an account | ${SITE_NAME}`};

export default function SignUpPage() {
  return (
    <AuthShell
      title="Create an account"
      intro="Schools: please use your school email address. It helps us verify your account."
    >
      <GoogleSignInButton next="/onboarding" />
      <AuthForm action={signUpAction} submitLabel="Create account">
        <label className="field">
          Email
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label className="field">
          Password (at least {MIN_PASSWORD_LENGTH} characters)
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            required
          />
        </label>
        <label className="field">
          Confirm password
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
        <span>
          Already have an account? <Link href="/sign-in">Sign in</Link>
        </span>
      </p>
    </AuthShell>
  );
}
