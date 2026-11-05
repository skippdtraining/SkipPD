/**
 * @fileoverview Reads and validates the profile form (onboarding and
 * account pages).
 *
 * Runs on the server inside the save action, so the checks cannot be
 * skipped by editing the page. Pure: no database calls.
 */

import {
  US_STATES,
  CERTIFICATION_TYPES,
  MAX_CERTIFICATION_BYTES,
  PROFILE_LIMITS,
} from '@/config/accounts';
import {readText} from './form-helpers';
import type {AccountRole, ProfileInput} from './types';

/** Result of reading the form: the values, or a message for the user. */
export type ParsedProfileForm =
  | {ok: true; input: ProfileInput; certification: File | null}
  | {ok: false; message: string};

/** Returns the field's text, or null when it is longer than allowed. */
function readLimited(data: FormData, field: keyof typeof PROFILE_LIMITS): string | null {
  const value = readText(data, field);
  return value.length <= PROFILE_LIMITS[field] ? value : null;
}

/**
 * Validates the submitted profile form.
 *
 * @param fixedRole The account type of an existing profile. When set, the
 *     form's role field is ignored, because the account type cannot change.
 */
export function parseProfileForm(
  data: FormData,
  fixedRole: AccountRole | null,
): ParsedProfileForm {
  const submittedRole = readText(data, 'role');
  const role: AccountRole | null =
    fixedRole ??
    (submittedRole === 'trainer' || submittedRole === 'school' ? submittedRole : null);
  if (!role) return {ok: false, message: 'Choose an account type.'};

  const fullName = readLimited(data, 'fullName');
  const credentials = readLimited(data, 'credentials');
  const employer = readLimited(data, 'employer');
  const bio = readLimited(data, 'bio');
  const schoolName = readLimited(data, 'schoolName');
  const contactPosition = readLimited(data, 'contactPosition');
  if (
    fullName === null ||
    credentials === null ||
    employer === null ||
    bio === null ||
    schoolName === null ||
    contactPosition === null
  ) {
    return {ok: false, message: 'One of the fields is too long.'};
  }
  if (fullName === '') return {ok: false, message: 'Enter your name.'};

  if (role === 'school') {
    if (schoolName === '') return {ok: false, message: 'Enter your school or district.'};
    if (contactPosition === '') return {ok: false, message: 'Enter your position.'};
    return {
      ok: true,
      certification: null,
      input: {
        role,
        fullName,
        schoolName,
        contactPosition,
        credentials: '',
        licenseState: '',
        licenseNumber: '',
        isEmployed: null,
        employer: '',
        bio: '',
      },
    };
  }

  // License is optional, but state and number go together.
  const licenseState = readText(data, 'licenseState').toUpperCase();
  const licenseNumber = readText(data, 'licenseNumber');
  if (licenseState !== '' && !US_STATES.includes(licenseState)) {
    return {ok: false, message: 'Choose a valid license state.'};
  }
  if (licenseNumber.length > PROFILE_LIMITS.licenseNumber) {
    return {ok: false, message: 'License number is too long.'};
  }
  if ((licenseState === '') !== (licenseNumber === '')) {
    return {ok: false, message: 'Enter both the license state and number, or neither.'};
  }

  const isEmployed = readText(data, 'isEmployed') === 'yes';
  if (isEmployed && employer === '') {
    return {ok: false, message: 'Enter your current place of employment.'};
  }

  // An empty file input still sends a File with size 0.
  const file = data.get('certification');
  const certification = file instanceof File && file.size > 0 ? file : null;
  if (certification) {
    if (!CERTIFICATION_TYPES.includes(certification.type)) {
      return {ok: false, message: 'Certification must be a PDF, JPG or PNG file.'};
    }
    if (certification.size > MAX_CERTIFICATION_BYTES) {
      const maxMegabytes = MAX_CERTIFICATION_BYTES / (1024 * 1024);
      return {
        ok: false,
        message: `Certification file is too large (max ${maxMegabytes} MB).`,
      };
    }
  }

  return {
    ok: true,
    certification,
    input: {
      role,
      fullName,
      credentials,
      licenseState,
      licenseNumber,
      isEmployed,
      employer: isEmployed ? employer : '',
      bio,
      schoolName: '',
      contactPosition: '',
    },
  };
}
