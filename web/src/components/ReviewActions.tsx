/**
 * @fileoverview Approve / Reject controls for one review item, plus the
 * "View certificate file" button. Shared by the tile view (ReviewCard) and
 * the table view (ReviewTable), so both behave the same.
 */

'use client';

import {useActionState} from 'react';
import {reviewAction} from '@/app/actions/admin';
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
        // Opens a 10-minute signed link in a new tab; the server re-checks
        // the admin flag. rel=noopener so the new tab cannot touch us.
        <a
          className="btn light small"
          href={`/admin/file/${request.userId}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          View file
        </a>
      )}
      <form action={formAction} className="review-form">
        <FormError message={state.error} trigger={state} />
        {state.success && <p className="review-success">{state.success}</p>}
        <input type="hidden" name="userId" value={request.userId} />
        <input type="hidden" name="item" value={request.item} />
        {request.item === 'certification' && (
          <input
            type="hidden"
            name="certificationPath"
            value={request.certificationPath ?? ''}
          />
        )}
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
