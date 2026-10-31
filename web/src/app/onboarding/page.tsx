/**
 * @fileoverview Route for "/onboarding": first-time profile form, shown
 * right after sign-up (email or Google). Users who already have a profile
 * go to "/account". Next.js requires a default export.
 */

import type {Metadata} from 'next';
import {redirect} from 'next/navigation';
import {Suspense} from 'react';
import {AuthShell} from '@/components/AuthShell';
import {ProfileForm} from '@/components/ProfileForm';
import {SITE_NAME} from '@/config/site';
import {getViewer} from '@/lib/viewer';

export const metadata: Metadata = {title: `Set up your profile | ${SITE_NAME}`};

/** Checks the session, then shows the empty profile form. */
async function OnboardingContent() {
  const viewer = await getViewer();
  if (!viewer) redirect('/sign-in?next=/onboarding');
  if (viewer.profile) redirect('/account');
  return <ProfileForm profile={null} submitLabel="Save profile" />;
}

export default function OnboardingPage() {
  return (
    <AuthShell
      title="Set up your profile"
      intro="Tell us who you are. You can edit these details later."
    >
      <Suspense>
        <OnboardingContent />
      </Suspense>
    </AuthShell>
  );
}
