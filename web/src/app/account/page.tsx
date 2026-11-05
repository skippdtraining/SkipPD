/**
 * @fileoverview Route for "/account": review status, profile summary (with
 * an Edit button),
 * password change, sign-out and account deletion. Next.js requires a default export.
 */

import type {Metadata} from 'next';
import Link from 'next/link';
import {redirect} from 'next/navigation';
import {Suspense} from 'react';
import {signOutAction} from '@/app/actions/auth';
import {AccountStatus} from '@/components/AccountStatus';
import {DeleteAccount} from '@/components/DeleteAccount';
import {AuthShell} from '@/components/AuthShell';
import {AccountProfile} from '@/components/AccountProfile';
import {SITE_NAME} from '@/config/site';
import {getViewer} from '@/lib/viewer';

export const metadata: Metadata = {title: `Your account | ${SITE_NAME}`};

/** Checks the session, then shows status and the filled-in profile form. */
async function AccountContent({searchParams}: PageProps<'/account'>) {
  const viewer = await getViewer();
  if (!viewer) redirect('/sign-in?next=/account');
  if (!viewer.profile) redirect('/onboarding');
  return (
    <>
      <p className="auth-intro">Signed in as {viewer.email}</p>
      {(await searchParams).upload === 'failed' && (
        <p className="form-error" role="alert">
          Your profile was saved, but the certification file could not be uploaded. Use
          Edit profile to try again.
        </p>
      )}
      <AccountStatus profile={viewer.profile} />
      <AccountProfile profile={viewer.profile} />
      <div className="auth-links">
        <Link href="/">← Back to trainings</Link>
        <Link href="/account/password">Change password</Link>
        <form action={signOutAction}>
          <button className="link-button">Sign out</button>
        </form>
      </div>
      <div className="account-danger">
        <DeleteAccount />
      </div>
    </>
  );
}

export default function AccountPage(props: PageProps<'/account'>) {
  return (
    <AuthShell title="Your account">
      <Suspense>
        <AccountContent {...props} />
      </Suspense>
    </AuthShell>
  );
}
