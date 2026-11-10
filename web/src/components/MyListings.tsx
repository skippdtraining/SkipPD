/**
 * @fileoverview "My listings" dialog: the signed-in trainer's own listings,
 * including ones hidden from the catalog, with Edit and Delete (Step 6).
 *
 * State (the list itself, loading and refresh) lives in `HomePage.tsx`; this
 * component only displays it and reports changes.
 */

'use client';

import {useActionState, useEffect, useEffectEvent, useState} from 'react';
import {deleteListingAction} from '@/app/actions/listings';
import {formatPrice} from '@/lib/format';
import type {Course} from '@/lib/types';
import {FormError} from './FormError';

interface MyListingsProps {
  /** The trainer's listings, or null while they load. */
  listings: Course[] | null;
  /** Opens the edit form for one listing. */
  onEdit: (listing: Course) => void;
  /** Called after a listing was deleted, so the parent can refresh. */
  onDeleted: () => void;
  /** Opens the create form. */
  onCreate: () => void;
}

/** List of the trainer's listings plus a create button. */
export function MyListings({listings, onEdit, onDeleted, onCreate}: MyListingsProps) {
  if (listings === null) return <p className="small-text">Loading your listings…</p>;

  return (
    <>
      {listings.length === 0 ? (
        <p className="small-text">
          You have no listings yet. Create one so schools can find your training.
        </p>
      ) : (
        <ul className="my-listings">
          {listings.map((listing) => (
            <MyListingRow
              key={listing.id}
              listing={listing}
              onEdit={onEdit}
              onDeleted={onDeleted}
            />
          ))}
        </ul>
      )}
      <button className="btn wide" onClick={onCreate}>
        + Create a new listing
      </button>
    </>
  );
}

interface MyListingRowProps {
  listing: Course;
  onEdit: (listing: Course) => void;
  onDeleted: () => void;
}

/** One listing: title, catalog status, price, Edit and a two-step Delete. */
function MyListingRow({listing, onEdit, onDeleted}: MyListingRowProps) {
  const [state, formAction, pending] = useActionState(deleteListingAction, {});
  const [confirming, setConfirming] = useState(false);

  // Tell the parent once after each successful delete.
  const notifyDeleted = useEffectEvent(() => {
    onDeleted();
  });
  useEffect(() => {
    if (state.deletedCount) notifyDeleted();
  }, [state.deletedCount]);

  return (
    <li className="my-listing">
      <div>
        <b>{listing.title}</b>
        <div className="small-text">
          {listing.isPublished ? 'In the catalog' : 'Hidden from the catalog'} ·{' '}
          {formatPrice(listing.price)} per person
        </div>
        <FormError message={state.error} trigger={state} />
      </div>
      <div className="my-listing-actions">
        <button
          className="btn light small"
          onClick={() => {
            onEdit(listing);
          }}
        >
          Edit
        </button>
        {confirming ? (
          <form action={formAction} className="inline-form">
            <input type="hidden" name="listingId" value={listing.id} />
            <button className="btn small danger" disabled={pending}>
              {pending ? 'Deleting…' : 'Delete forever'}
            </button>
            <button
              type="button"
              className="btn light small"
              onClick={() => {
                setConfirming(false);
              }}
            >
              Cancel
            </button>
          </form>
        ) : (
          <button
            className="btn light small"
            onClick={() => {
              setConfirming(true);
            }}
          >
            Delete
          </button>
        )}
      </div>
    </li>
  );
}
