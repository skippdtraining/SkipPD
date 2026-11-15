/**
 * @fileoverview "/my-listings": the signed-in trainer's own listings (hidden
 * ones included) plus the create / edit form (Step 6).
 *
 * State (list vs. form, toast) lives here; the rows arrive from the server
 * component `app/my-listings/page.tsx`, and save/delete refresh the page so
 * the new state flows back in. Delete is a two-step server action.
 */

'use client';

import {useActionState, useEffect, useEffectEvent, useState} from 'react';
import {useRouter} from 'next/navigation';
import {deleteListingAction} from '@/app/actions/listings';
import {formatPrice} from '@/lib/format';
import {useToast} from '@/lib/use-toast';
import type {Course} from '@/lib/types';
import {FormError} from './FormError';
import {ListingForm} from './ListingForm';

interface MyListingsProps {
  /** The trainer's own listings, newest first, hidden ones included. */
  listings: Course[];
  /** Suggested topics for the listing form, in display order. */
  categories: string[];
  /** True when the page was opened as /my-listings?new=1. */
  startNew: boolean;
}

/** What the page shows: the list, the create form, or one listing's edits. */
type View = {kind: 'list'} | {kind: 'create'} | {kind: 'edit'; listing: Course};

/** Trainer's listings page: rows, or the listing form in create/edit mode. */
export function MyListings({listings, categories, startNew}: MyListingsProps) {
  const router = useRouter();
  const [toast, showToast] = useToast();
  const [view, setView] = useState<View>(startNew ? {kind: 'create'} : {kind: 'list'});

  // Opening /my-listings?new=1 while this page is already mounted switches
  // to the form: adjust state when the prop changes (no effect needed).
  const [seenStartNew, setSeenStartNew] = useState(startNew);
  if (startNew !== seenStartNew) {
    setSeenStartNew(startNew);
    if (startNew) setView({kind: 'create'});
  }

  function handleSaved() {
    setView({kind: 'list'});
    showToast('Your listing was saved.');
    // Drops ?new=1 and re-reads the rows from the server in one step.
    router.replace('/my-listings', {scroll: false});
  }

  function handleDeleted() {
    showToast('Listing deleted.');
    router.refresh();
  }

  if (view.kind !== 'list') {
    return (
      <>
        <div className="my-listings-head">
          <h1>{view.kind === 'edit' ? 'Edit your training' : 'Create your training'}</h1>
          <button
            className="btn light small"
            type="button"
            onClick={() => {
              setView({kind: 'list'});
            }}
          >
            ← Back to my listings
          </button>
        </div>
        <div className="my-listings-form">
          <ListingForm
            categories={categories}
            listing={view.kind === 'edit' ? view.listing : undefined}
            onSaved={handleSaved}
          />
        </div>
        {toast && (
          <div className="toast" role="status">
            {toast}
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className="my-listings-head">
        <h1>My listings</h1>
        <button
          className="btn small"
          type="button"
          onClick={() => {
            setView({kind: 'create'});
          }}
        >
          + Create a new listing
        </button>
      </div>
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
              onEdit={() => {
                setView({kind: 'edit', listing});
              }}
              onDeleted={handleDeleted}
            />
          ))}
        </ul>
      )}
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </>
  );
}

interface MyListingRowProps {
  listing: Course;
  onEdit: () => void;
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
        <button className="btn light small" onClick={onEdit}>
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
