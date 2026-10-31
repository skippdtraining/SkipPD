/**
 * @fileoverview Profile section of the account page: a read-only summary
 * with an "Edit profile" button that swaps in the {@link ProfileForm}.
 *
 * Why: showing an open form all the time made the page look unfinished.
 * Editing is now an explicit choice, and saving returns to the summary.
 */

'use client';

import {useState} from 'react';
import {isFieldLocked, LOCKED_FIELD_NOTE} from '@/lib/profile-locks';
import type {Profile} from '@/lib/types';
import {ProfileForm} from './ProfileForm';

interface AccountProfileProps {
  profile: Profile;
}

/** One label/value row; skipped when the value is empty. */
function Row({label, value, locked}: {label: string; value: string; locked?: boolean}) {
  if (value === '') return null;
  return (
    <div className="profile-row">
      <dt>{label}</dt>
      <dd>
        {value}
        {locked && (
          <span
            className="lock-icon"
            title={LOCKED_FIELD_NOTE}
            aria-label={LOCKED_FIELD_NOTE}
          >
            {' '}
            🔒
          </span>
        )}
      </dd>
    </div>
  );
}

/** Profile summary, or the edit form after clicking "Edit profile". */
export function AccountProfile({profile}: AccountProfileProps) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <ProfileForm
        profile={profile}
        submitLabel="Save changes"
        onSaved={() => {
          setEditing(false);
        }}
        onCancel={() => {
          setEditing(false);
        }}
      />
    );
  }

  const isTrainer = profile.role === 'trainer';
  return (
    <>
      <dl className="profile-summary">
        <Row label="Account type" value={isTrainer ? 'Trainer' : 'School'} />
        <Row
          label={isTrainer ? 'Name' : 'Contact name'}
          value={profile.fullName}
          locked={isFieldLocked(profile, 'fullName')}
        />
        {isTrainer ? (
          <>
            <Row label="Credentials" value={profile.credentials} />
            <Row
              label="Employment"
              value={profile.isEmployed ? profile.employer : 'Not currently employed'}
            />
            <Row label="About" value={profile.bio} />
            <Row
              label="Certification file"
              value={profile.hasCertification ? 'Uploaded' : 'None'}
            />
          </>
        ) : (
          <>
            <Row
              label="School or district"
              value={profile.schoolName}
              locked={isFieldLocked(profile, 'schoolName')}
            />
            <Row label="Position" value={profile.contactPosition} />
          </>
        )}
      </dl>
      <button
        className="btn light wide"
        onClick={() => {
          setEditing(true);
        }}
      >
        Edit profile
      </button>
    </>
  );
}
