/**
 * @fileoverview The three lists the app currently keeps in the browser,
 * matching the POC: saved course ids, the user's own listings, and booking
 * requests.
 *
 * TEMPORARY. Each store is replaced by a database table:
 * - saved courses -> Step 7
 * - own listings  -> Step 6
 * - requests      -> Step 8
 * Components only call the functions below, so swapping the storage later
 * does not require changing the components much.
 */

'use client';

import {createLocalStore, isArray} from './local-store';
import type {BookingRequest, Course} from './types';

// ---------- Saved (bookmarked) courses ----------

const savedStore = createLocalStore<number>(
  'skippd-saved',
  (value): value is number[] =>
    Array.isArray(value) && value.every((id) => typeof id === 'number'),
);

/** React hook: ids of bookmarked courses. */
export function useSavedIds(): number[] {
  return savedStore.use();
}

/** Adds the id if missing, removes it if present. */
export function toggleSaved(courseId: number): boolean {
  const current = savedStore.get();
  const next = current.includes(courseId)
    ? current.filter((id) => id !== courseId)
    : [...current, courseId];
  return savedStore.set(next);
}

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
