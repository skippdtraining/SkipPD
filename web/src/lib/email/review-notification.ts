/**
 * @fileoverview Builds the approval / rejection email an admin's decision
 * sends to the trainer or school.
 *
 * Why: the wording lives next to the only place it is used. The action
 * ({@link reviewAction}) sends best-effort — a failed email never undoes
 * the saved decision.
 *
 * Server only.
 */

import type {EmailMessage} from './email-service';
import type {ReviewDecision, ReviewItem} from '../types';

/** What each queue item is called in an email. */
const ITEM_LABELS: Record<ReviewItem, string> = {
  certification: 'PD certification',
  license: 'teaching license',
  school: 'school account',
};

/** Input for one review-result email. */
export interface ReviewEmailInput {
  /** Recipient (the profile owner's email). */
  to: string;
  /** Profile full name. */
  fullName: string;
  item: ReviewItem;
  decision: ReviewDecision;
  /** Rejection reason; ignored when approved. */
  reason: string;
  /** Absolute `/account` URL for this environment. */
  accountUrl: string;
}

/** Subject and body for one approve / reject notice. */
export function buildReviewEmail(input: ReviewEmailInput): EmailMessage {
  const label = ITEM_LABELS[input.item];
  const approved = input.decision === 'approved';
  const subject = approved
    ? `Your SkipPD ${label} was approved`
    : `Your SkipPD ${label} needs a change`;

  const lines = [
    `Hi ${input.fullName},`,
    '',
    approved
      ? `Your ${label} is approved. You can see it on your account page.`
      : `Your ${label} was not approved.`,
  ];
  if (!approved && input.reason) {
    lines.push('', `Reason: ${input.reason}`);
  }
  lines.push('', `Account page: ${input.accountUrl}`, '', '— SkipPD');

  return {
    to: input.to,
    subject,
    text: lines.join('\n'),
  };
}
