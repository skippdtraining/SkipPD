/**
 * @fileoverview One entry in the admin review queue, tile view: who, what
 * to check, and the shared Approve / Reject controls.
 */

import {formatDateTime} from '@/lib/format';
import type {ReviewItem, ReviewRequest} from '@/lib/types';
import {ReviewItemActions} from './ReviewItemActions';
import {SchoolEmailHint} from './SchoolEmailHint';

/** What the admin should check, per item. */
const ITEM_HINTS: Record<ReviewItem, string> = {
  certification: 'Open the file and check that the name matches.',
  license: 'Check the number on the state’s public license lookup.',
  school: 'Check that the person works at this school (email domain helps).',
};

interface ReviewCardProps {
  request: ReviewRequest;
}

/** Review tile. */
export function ReviewCard({request}: ReviewCardProps) {
  return (
    <article className="review-card">
      <div className="review-card-top">
        <span className="review-date">{formatDateTime(request.submittedAt)}</span>
        {request.item === 'school' && (
          <SchoolEmailHint likely={request.isLikelySchoolEmail} />
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
      <ReviewItemActions request={request} />
    </article>
  );
}
