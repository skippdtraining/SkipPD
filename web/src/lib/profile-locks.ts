/**
 * @fileoverview Which profile fields are locked after admin approval.
 *
 * Why: an approved trainer or school must not rename themselves into
 * someone else. The database enforces the same rule
 * (supabase/migrations/0004_lock_approved_profiles.sql); this file lets the
 * form, the account summary and the save action agree with it.
 */

import type {Profile, ProfileInput} from './types';

/** Note shown next to locked fields. */
export const LOCKED_FIELD_NOTE = 'Locked after approval. Contact us to change it.';

/** Profile fields that can be locked. */
export type LockableField = 'fullName' | 'schoolName' | 'license';

/** True when `field` can no longer be changed by the user. */
export function isFieldLocked(profile: Profile | null, field: LockableField): boolean {
  if (!profile) return false;
  if (field === 'license') {
    return profile.role === 'trainer' && profile.licenseStatus === 'approved';
  }
  if (field === 'fullName') {
    return profile.role === 'trainer' && profile.certificationStatus === 'approved';
  }
  return profile.role === 'school' && profile.schoolStatus === 'approved';
}

/** Returns `input` with locked fields reset to their stored values. */
export function keepLockedFields(
  input: ProfileInput,
  profile: Profile | null,
): ProfileInput {
  if (!profile) return input;
  return {
    ...input,
    fullName: isFieldLocked(profile, 'fullName') ? profile.fullName : input.fullName,
    schoolName: isFieldLocked(profile, 'schoolName')
      ? profile.schoolName
      : input.schoolName,
    licenseState: isFieldLocked(profile, 'license')
      ? profile.licenseState
      : input.licenseState,
    licenseNumber: isFieldLocked(profile, 'license')
      ? profile.licenseNumber
      : input.licenseNumber,
  };
}
