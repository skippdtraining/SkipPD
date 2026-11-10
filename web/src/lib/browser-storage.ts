/**
 * @fileoverview The booking requests the app keeps in the browser, matching
 * the POC.
 *
 * TEMPORARY. The list is replaced by a database table in Step 7.
 * Components only call the functions below, so swapping the storage later
 * does not require changing the components much.
 */

'use client';

import {createLocalStore, isArray} from './local-store';
import type {BookingRequest} from './types';

// The Saved feature was removed; clear its old list from returning
// browsers once. TEMPORARY: delete after a few weeks in production.
if (typeof window !== 'undefined') window.localStorage.removeItem('skippd-saved');

const requestStore = createLocalStore<BookingRequest>('skippd-requests', isArray);

/** React hook: booking requests the user saved, oldest first. */
export function useRequests(): BookingRequest[] {
  return requestStore.use();
}

/** Stores a new booking request. Returns false if storage is full. */
export function addRequest(request: BookingRequest): boolean {
  return requestStore.set([...requestStore.get(), request]);
}

/** Deletes a booking request by id. */
export function removeRequest(requestId: number): boolean {
  return requestStore.set(requestStore.get().filter((r) => r.id !== requestId));
}
