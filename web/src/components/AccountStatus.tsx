/**
 * @fileoverview Review status box on the account page: certification
 * status for trainers, verification status for schools.
 */

import type {Profile, ReviewStatus} from '@/lib/types';

/** Trainer certification wording per review status. */
const CERTIFICATION_TEXT: Record<ReviewStatus, string> = {
  none: 'Not certified. Upload your PD certification below to get the "Certified" badge.',
  pending: 'Not certified yet. Your certification is waiting for review.',
  approved: 'Certified. Your certification was approved.',
  rejected:
    'Not certified. Your certification was not approved; you can upload a new file.',
};

/** Trainer teaching-license wording per review status. */
const LICENSE_TEXT: Record<ReviewStatus, string> = {
  none: 'Not licensed. Add your teaching license below to get the "Licensed" badge.',
  pending: 'Not licensed yet. Your teaching license is waiting for review.',
  approved: 'Licensed. Your teaching license was verified.',
  rejected: 'Not licensed. We could not verify your license; check the state and number.',
};

/** School verification wording per review status. */
const SCHOOL_TEXT: Record<ReviewStatus, string> = {
  none: 'Waiting for verification.',
  pending: 'Waiting for verification. We check that you work at this school.',
  approved: 'Verified school account.',
  rejected: 'We could not verify this school account. Please contact us.',
};

interface AccountStatusProps {
  profile: Profile;
}

/** One coloured status line. */
function StatusLine({status, text}: {status: ReviewStatus; text: string}) {
  return (
    <p className={`account-status status-${status}`} role="status">
      {text}
    </p>
  );
}

/** Shows the admin review state(s): certificate + license for trainers. */
export function AccountStatus({profile}: AccountStatusProps) {
  if (profile.role === 'school') {
    return (
      <StatusLine
        status={profile.schoolStatus}
        text={SCHOOL_TEXT[profile.schoolStatus]}
      />
    );
  }
  return (
    <>
      <StatusLine
        status={profile.certificationStatus}
        text={CERTIFICATION_TEXT[profile.certificationStatus]}
      />
      <StatusLine
        status={profile.licenseStatus}
        text={LICENSE_TEXT[profile.licenseStatus]}
      />
    </>
  );
}
