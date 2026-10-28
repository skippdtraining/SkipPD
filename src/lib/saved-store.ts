"use client";

import { useSyncExternalStore } from "react";

/**
 * Saved (bookmarked) course ids, kept in localStorage.
 * Temporary: Step 5 stores saved listings per user in the database.
 */
const KEY = "skippd-saved";
const EMPTY: number[] = [];
const listeners = new Set<() => void>();
let cache: number[] | null = null;

function read(): number[] {
  if (cache) return cache;
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    cache = Array.isArray(v) ? v.filter((x): x is number => typeof x === "number") : [];
  } catch {
    cache = [];
  }
  return cache;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function toggleSaved(id: number) {
  const cur = read();
  cache = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    // Storage full or blocked: keep the in-memory value for this session.
  }
  listeners.forEach((l) => l());
}

export function useSaved(): number[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}
