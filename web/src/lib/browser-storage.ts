/**
 * @fileoverview The two lists the app currently keeps in the browser,
 * matching the POC: the user's own listings and booking requests.
 *
 * TEMPORARY. Each store is replaced by a database table:
 * - own listings  -> Step 6
 * - requests      -> Step 7
 * Components only call the functions below, so swapping the storage later
 * does not require changing the components much.
 */

'use client';

import {createLocalStore, isArray} from './local-store';
import type {BookingRequest, Course} from './types';

// ---------- Listings created in this browser ----------

const listingStore = createLocalStore<Course>('skippd-courses', isArray);

/** React hook: listings the user created, newest first. */
export function useOwnListings(): Course[] {
  return listingStore.use();
}

/** Stores a new listing. Returns false if storage is full (large image). */
export function addListing(course: Course): boolean {
  return listingStore.set([course, ...listingStore.get()]);
}

// ---------- Booking requests ----------

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
