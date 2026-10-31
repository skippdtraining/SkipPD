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

/** Shows the admin review state of the profile. */
export function AccountStatus({profile}: AccountStatusProps) {
  const status =
    profile.role === 'trainer' ? profile.certificationStatus : profile.schoolStatus;
  const text =
    profile.role === 'trainer' ? CERTIFICATION_TEXT[status] : SCHOOL_TEXT[status];
  return (
    <p className={`account-status status-${status}`} role="status">
      {text}
    </p>
  );
}
