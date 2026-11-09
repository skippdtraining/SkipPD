/**
 * @fileoverview Approve / Reject controls for one review item, plus the
 * "View certificate file" button. Shared by the tile view (ReviewCard) and
 * the table view (ReviewTable), so both behave the same.
 */

'use client';

import {useActionState} from 'react';
import {openCertificationAction, reviewAction} from '@/app/actions/admin';
import {MAX_REVIEW_REASON_LENGTH} from '@/config/accounts';
import type {ReviewRequest} from '@/lib/types';
import {FormError} from './FormError';

interface ReviewActionsProps {
  request: ReviewRequest;
  /** Table rows use a one-line reason field and smaller buttons. */
  compact?: boolean;
}

/** View-file button (certificates only) and the decision form. */
export function ReviewActions({request, compact = false}: ReviewActionsProps) {
  const [state, formAction, pending] = useActionState(reviewAction, {});

  return (
    <div className={compact ? 'review-actions-compact' : undefined}>
      {request.item === 'certification' && (
        // Separate form (forms cannot be nested): opens a 10-minute link to
        // the private file in a new tab.
        <form action={openCertificationAction} target="_blank">
          <input type="hidden" name="userId" value={request.userId} />
          <button className="btn light small">View file</button>
        </form>
      )}
      <form action={formAction} className="review-form">
        <FormError message={state.error} trigger={state} />
        <input type="hidden" name="userId" value={request.userId} />
        <input type="hidden" name="item" value={request.item} />
        {compact ? (
          <input
            name="reason"
            className="review-reason-input"
            maxLength={MAX_REVIEW_REASON_LENGTH}
            placeholder="Reason if rejecting"
            aria-label={`Rejection reason for ${request.fullName}`}
          />
        ) : (
          <label className="field">
            Reason (shown to the user if rejected)
            <textarea name="reason" maxLength={MAX_REVIEW_REASON_LENGTH} rows={2} />
          </label>
        )}
        <div className="review-actions">
          <button
            className={`btn ${compact ? 'small' : ''}`}
            name="decision"
            value="approved"
            disabled={pending}
          >
            Approve
          </button>
          <button
            className={`btn danger ${compact ? 'small' : ''}`}
            name="decision"
            value="rejected"
            disabled={pending}
          >
            Reject
          </button>
        </div>
      </form>
    </div>
  );
}
