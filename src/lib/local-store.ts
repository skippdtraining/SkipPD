"use client";

import { useSyncExternalStore } from "react";

/**
 * Tiny localStorage-backed store usable from React via useSyncExternalStore.
 * Temporary: these stores are replaced by database tables in later steps
 * (saved listings: step 5, listings: step 4, booking requests: step 6).
 */
export function createLocalStore<T>(key: string, validate: (v: unknown) => v is T[]) {
  const EMPTY: T[] = [];
  const listeners = new Set<() => void>();
  let cache: T[] | null = null;

  function read(): T[] {
    if (cache) return cache;
    try {
      const v: unknown = JSON.parse(localStorage.getItem(key) ?? "[]");
      cache = validate(v) ? v : [];
    } catch {
      cache = [];
    }
    return cache;
  }

  /** Returns false if the browser refused to store the value (e.g. storage full). */
  function write(next: T[]): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      return false;
    }
    cache = next;
    listeners.forEach((l) => l());
    return true;
  }

  function subscribe(cb: () => void) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  }

  return {
    get: read,
    set: write,
    use: () => useSyncExternalStore(subscribe, read, () => EMPTY),
  };
}

export const isArray = (v: unknown): v is never[] => Array.isArray(v);
