/**
 * @fileoverview Route for "/account": review status, profile editing,
 * password change and sign-out. Next.js requires a default export.
 */

import type {Metadata} from 'next';
import Link from 'next/link';
import {redirect} from 'next/navigation';
import {Suspense} from 'react';
import {signOutAction} from '@/app/actions/auth';
import {AccountStatus} from '@/components/AccountStatus';
import {AuthShell} from '@/components/AuthShell';
import {ProfileForm} from '@/components/ProfileForm';
import {SITE_NAME} from '@/config/site';
import {getViewer} from '@/lib/viewer';

export const metadata: Metadata = {title: `Your account | ${SITE_NAME}`};

/** Checks the session, then shows status and the filled-in profile form. */
async function AccountContent() {
  const viewer = await getViewer();
  if (!viewer) redirect('/sign-in?next=/account');
  if (!viewer.profile) redirect('/onboarding');
  return (
    <>
      <p className="auth-intro">Signed in as {viewer.email}</p>
      <AccountStatus profile={viewer.profile} />
      <ProfileForm profile={viewer.profile} submitLabel="Save changes" />
      <div className="auth-links">
        <Link href="/reset-password">Change password</Link>
        <form action={signOutAction}>
          <button className="link-button">Sign out</button>
        </form>
      </div>
    </>
  );
}

export default function AccountPage() {
  return (
    <AuthShell title="Your account">
      <Suspense>
        <AccountContent />
      </Suspense>
    </AuthShell>
  );
}
