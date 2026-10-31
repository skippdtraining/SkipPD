/**
 * @fileoverview Profile form for trainers and schools, used on
 * "/onboarding" (new profile) and "/account" (edit).
 *
 * The account type is chosen once; when editing it is shown but fixed.
 * Validation runs again on the server (lib/profile-form.ts).
 */

'use client';

import {useActionState, useEffect, useState} from 'react';
import {saveProfileAction} from '@/app/actions/profile';
import {
  CERTIFICATION_TYPES,
  MAX_CERTIFICATION_BYTES,
  PROFILE_LIMITS,
} from '@/config/accounts';
import {isFieldLocked, LOCKED_FIELD_NOTE} from '@/lib/profile-locks';
import {ACCOUNT_ROLES, type AccountRole, type Profile} from '@/lib/types';

interface ProfileFormProps {
  /** Existing profile to edit, or null for a new one. */
  profile: Profile | null;
  submitLabel: string;
  /** Called after an existing profile was saved (not used on onboarding). */
  onSaved?: () => void;
  /** Shows a Cancel button that calls this. */
  onCancel?: () => void;
}

/** Trainer or school profile form. */
export function ProfileForm({profile, submitLabel, onSaved, onCancel}: ProfileFormProps) {
  const [state, formAction, pending] = useActionState(saveProfileAction, {});
  const [role, setRole] = useState<AccountRole | null>(profile?.role ?? null);
  const [isEmployed, setIsEmployed] = useState(profile?.isEmployed ?? false);
  const maxMegabytes = MAX_CERTIFICATION_BYTES / (1024 * 1024);

  // Each successful save bumps savedCount; tell the parent once per save.
  useEffect(() => {
    if (state.savedCount) onSaved?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.savedCount]);

  return (
    <form action={formAction}>
      {state.error && (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      )}

      <fieldset className="role-choice" disabled={profile !== null}>
        <legend>Account type{profile && ' (cannot be changed)'}</legend>
        {ACCOUNT_ROLES.map((option) => (
          <label key={option.value} className="check">
            <input
              type="radio"
              name="role"
              value={option.value}
              checked={role === option.value}
              onChange={() => {
                setRole(option.value);
              }}
              required
            />
            <span>
              <b>{option.label}</b> {option.hint}
            </span>
          </label>
        ))}
      </fieldset>

      {role && (
        <label className="field">
          {role === 'school' ? 'Contact name' : 'Full name'}
          <input
            name="fullName"
            defaultValue={profile?.fullName}
            maxLength={PROFILE_LIMITS.fullName}
            autoComplete="name"
            readOnly={isFieldLocked(profile, 'fullName')}
            required
          />
          {isFieldLocked(profile, 'fullName') && <small>{LOCKED_FIELD_NOTE}</small>}
        </label>
      )}

      {role === 'school' && (
        <>
          <label className="field">
            School or district
            <input
              name="schoolName"
              defaultValue={profile?.schoolName}
              maxLength={PROFILE_LIMITS.schoolName}
              readOnly={isFieldLocked(profile, 'schoolName')}
              required
            />
            {isFieldLocked(profile, 'schoolName') && <small>{LOCKED_FIELD_NOTE}</small>}
          </label>
          <label className="field">
            Your position
            <input
              name="contactPosition"
              defaultValue={profile?.contactPosition}
              maxLength={PROFILE_LIMITS.contactPosition}
              placeholder="e.g., Principal, PD coordinator"
              required
            />
          </label>
        </>
      )}

      {role === 'trainer' && (
        <>
          <label className="field">
            Credentials (shown on your courses)
            <input
              name="credentials"
              defaultValue={profile?.credentials}
              maxLength={PROFILE_LIMITS.credentials}
              placeholder="e.g., Literacy coach · 14 years in education"
            />
          </label>
          <fieldset className="role-choice">
            <legend>Are you currently employed?</legend>
            {[true, false].map((value) => (
              <label key={String(value)} className="check">
                <input
                  type="radio"
                  name="isEmployed"
                  value={value ? 'yes' : 'no'}
                  checked={isEmployed === value}
                  onChange={() => {
                    setIsEmployed(value);
                  }}
                />
                <span>{value ? 'Yes' : 'No'}</span>
              </label>
            ))}
          </fieldset>
          {isEmployed && (
            <label className="field">
              Current place of employment
              <input
                name="employer"
                defaultValue={profile?.employer}
                maxLength={PROFILE_LIMITS.employer}
                required
              />
            </label>
          )}
          <label className="field">
            About you
            <textarea
              name="bio"
              defaultValue={profile?.bio}
              maxLength={PROFILE_LIMITS.bio}
              placeholder="Your background, experience and teaching approach"
            />
          </label>
          <label className="field">
            PD certification (optional, PDF / JPG / PNG, max {maxMegabytes} MB)
            <input
              type="file"
              name="certification"
              accept={CERTIFICATION_TYPES.join(',')}
            />
            <small>
              {profile?.hasCertification
                ? 'A file is on record. Uploading a new one replaces it and needs a new review.'
                : 'Reviewed by our team. Until approved, your profile and courses show "Not certified".'}
            </small>
          </label>
        </>
      )}

      <button className="btn wide" disabled={pending || !role}>
        {pending ? 'Saving…' : submitLabel}
      </button>
      {onCancel && (
        <button type="button" className="btn light wide form-cancel" onClick={onCancel}>
          Cancel
        </button>
      )}
    </form>
  );
}
