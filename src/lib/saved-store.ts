"use client";

import type { BookingRequest, Course } from "./types";
import { createLocalStore, isArray } from "./local-store";

/** Saved (bookmarked) course ids. Step 5 moves this to the database. */
const savedStore = createLocalStore<number>(
  "skippd-saved",
  (v): v is number[] => Array.isArray(v) && v.every((x) => typeof x === "number"),
);

export const useSaved = savedStore.use;

export function toggleSaved(id: number): boolean {
  const cur = savedStore.get();
  return savedStore.set(cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);
}

/** Listings created in this browser. Step 4 moves this to the database. */
const listingStore = createLocalStore<Course>("skippd-courses", isArray);

export const useOwnListings = listingStore.use;

export function addListing(c: Course): boolean {
  return listingStore.set([c, ...listingStore.get()]);
}

/** Booking requests made in this browser. Step 6 moves this to the database. */
const requestStore = createLocalStore<BookingRequest>("skippd-requests", isArray);

export const useRequests = requestStore.use;

export function addRequest(r: BookingRequest): boolean {
  return requestStore.set([...requestStore.get(), r]);
}

export function removeRequest(id: number): boolean {
  return requestStore.set(requestStore.get().filter((r) => r.id !== id));
}
