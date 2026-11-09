/**
 * @fileoverview Admin review queue, table view: one row per item with the
 * submitted date, person, details and the shared Approve / Reject controls.
 * Scrolls sideways on narrow screens instead of squeezing the columns.
 */

import {formatDateTime} from '@/lib/format';
import type {ReviewRequest} from '@/lib/types';
import {ReviewActions} from './ReviewActions';
import {SchoolEmailHint} from './SchoolEmailHint';

interface ReviewTableProps {
  /** Items on the current page. */
  requests: ReviewRequest[];
}

/** Review table. */
export function ReviewTable({requests}: ReviewTableProps) {
  return (
    <div className="review-table-wrap">
      <table className="review-table">
        <thead>
          <tr>
            <th scope="col">Submitted</th>
            <th scope="col">Name</th>
            <th scope="col">Details</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={`${request.item}-${request.userId}`}>
              <td className="review-date">{formatDateTime(request.submittedAt)}</td>
              <td>
                <b>{request.fullName}</b>
                <div className="review-email">{request.email}</div>
                {request.item === 'school' && (
                  <SchoolEmailHint likely={request.isLikelySchoolEmail} />
                )}
              </td>
              <td>
                {request.headline && <div>{request.headline}</div>}
                {request.details.map((line) => (
                  <div key={line} className="review-detail">
                    {line}
                  </div>
                ))}
              </td>
              <td>
                <ReviewActions request={request} compact />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
