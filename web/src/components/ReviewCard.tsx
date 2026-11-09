/**
 * @fileoverview One entry in the admin review queue: who, what to check,
 * and Approve / Reject buttons with an optional reason.
 */

'use client';

import {useActionState} from 'react';
import {openCertificationAction, reviewAction} from '@/app/actions/admin';
import {MAX_REVIEW_REASON_LENGTH} from '@/config/accounts';
import type {ReviewItem, ReviewRequest} from '@/lib/types';
import {FormError} from './FormError';

/** Card title per review item. */
const ITEM_LABELS: Record<ReviewItem, string> = {
  certification: 'PD-trainer certificate',
  license: 'Teaching license',
  school: 'School account',
};

/** What the admin should check, per item. */
const ITEM_HINTS: Record<ReviewItem, string> = {
  certification: 'Open the file and check that the name matches.',
  license: 'Check the number on the state’s public license lookup.',
  school: 'Check that the person works at this school (email domain helps).',
};

interface ReviewCardProps {
  request: ReviewRequest;
}

/** Review card with its own form state. */
export function ReviewCard({request}: ReviewCardProps) {
  const [state, formAction, pending] = useActionState(reviewAction, {});

  return (
    <article className="review-card">
      <div className="review-card-top">
        <span className="review-item">{ITEM_LABELS[request.item]}</span>
        {request.item === 'school' && (
          <span className={request.isLikelySchoolEmail ? 'hint-good' : 'hint-warn'}>
            {request.isLikelySchoolEmail ? 'School email' : 'Not a known school email'}
          </span>
        )}
      </div>
      <h3>{request.fullName}</h3>
      <p className="review-email">{request.email}</p>
      {request.headline && <p>{request.headline}</p>}
      {request.details.map((line) => (
        <p key={line} className="review-detail">
          {line}
        </p>
      ))}
      <p className="review-hint">{ITEM_HINTS[request.item]}</p>

      {request.item === 'certification' && (
        // Separate form: opens a 10-minute link to the private file.
        <form action={openCertificationAction} target="_blank">
          <input type="hidden" name="userId" value={request.userId} />
          <button className="btn light small">View certificate file</button>
        </form>
      )}

      <form action={formAction} className="review-form">
        <FormError message={state.error} trigger={state} />
        <input type="hidden" name="userId" value={request.userId} />
        <input type="hidden" name="item" value={request.item} />
        <label className="field">
          Reason (shown to the user if rejected)
          <textarea name="reason" maxLength={MAX_REVIEW_REASON_LENGTH} rows={2} />
        </label>
        <div className="review-actions">
          <button className="btn" name="decision" value="approved" disabled={pending}>
            Approve
          </button>
          <button
            className="btn danger"
            name="decision"
            value="rejected"
            disabled={pending}
          >
            Reject
          </button>
        </div>
      </form>
    </article>
  );
}
