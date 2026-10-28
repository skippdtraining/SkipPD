/**
 * @fileoverview Generic helper that keeps a list in the browser's
 * localStorage and lets React components re-render when it changes.
 *
 * Why this exists: until the database arrives, the POC behaviour (saved
 * courses, own listings, booking requests that survive a page reload) needs
 * somewhere to live. Each list is a "store" created with
 * {@link createLocalStore}; see `browser-storage.ts` for the actual stores.
 *
 * Why `useSyncExternalStore`: it is React's built-in way to read data that
 * lives outside React (here, localStorage). It also handles server
 * rendering: on the server there is no localStorage, so it uses an empty
 * list, then swaps in the real data in the browser.
 */

'use client';

import {useSyncExternalStore} from 'react';

/** Read / write / subscribe access to one persisted list. */
export interface LocalStore<T> {
  /** Current list. Always returns the same array until the list changes. */
  get(): T[];
  /** Replaces the list. Returns false if the browser refused (storage full). */
  set(next: T[]): boolean;
  /** React hook: returns the current list and re-renders on every change. */
  use(): T[];
}

/**
 * Creates a store for one localStorage key.
 *
 * @param key localStorage key, prefixed with "skippd-" by convention.
 * @param isValid Checks parsed JSON, so corrupted or old data is ignored
 *     instead of crashing the page.
 */
export function createLocalStore<T>(
  key: string,
  isValid: (value: unknown) => value is T[],
): LocalStore<T> {
  // A stable empty array: React compares snapshots by reference, so returning
  // a new [] every time would cause endless re-renders.
  const emptyList: T[] = [];
  const listeners = new Set<() => void>();
  // In-memory copy, so we parse JSON once instead of on every render.
  let cache: T[] | null = null;

  function get(): T[] {
    if (cache !== null) return cache;
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(key) ?? '[]');
      cache = isValid(parsed) ? parsed : [];
    } catch {
      cache = [];
    }
    return cache;
  }

  function set(next: T[]): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      return false;
    }
    cache = next;
    for (const notify of listeners) notify();
    return true;
  }

  function subscribe(onChange: () => void): () => void {
    listeners.add(onChange);
    return () => {
      listeners.delete(onChange);
    };
  }

  function use(): T[] {
    return useSyncExternalStore(subscribe, get, () => emptyList);
  }

  return {get, set, use};
}

/** Loose validator for lists of objects we wrote ourselves. */
export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}
