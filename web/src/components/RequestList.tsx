/**
 * @fileoverview Content of the "My booking requests" dialog. Reads requests
 * from browser storage for now; Step 8 reads them from the database.
 */

'use client';

import {removeRequest, useRequests} from '@/lib/browser-storage';

/** List of saved booking requests, each with a Remove button. */
export function RequestList() {
  const requests = useRequests();

  return (
    <>
      <div className="notice">
        Saved in this browser only. Trainers have not been contacted.
      </div>
      {requests.length === 0 && (
        <p>
          No requests yet. Explore a course and request a session to start planning your
          PD.
        </p>
      )}
      {requests.map((request) => (
        <div key={request.id} className="request">
          {/* "Draft" until Step 8 adds real statuses (requested, negotiating...). */}
          <span className="status">Draft request</span>
          <strong>{request.course}</strong>
          <p>
            {request.trainer} · {request.date} · {request.participants} participant(s)
          </p>
          <p>
            {request.name} · {request.email}
          </p>
          {request.school && <p>{request.school}</p>}
          {request.message && <p>{request.message}</p>}
          <button
            className="plain remove"
            onClick={() => {
              removeRequest(request.id);
            }}
          >
            Remove request
          </button>
        </div>
      ))}
    </>
  );
}
