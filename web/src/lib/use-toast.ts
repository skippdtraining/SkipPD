/**
 * @fileoverview React hook for the short message ("toast") shown at the
 * bottom of the screen after an action, e.g. "Request saved".
 */

'use client';

import {useRef, useState} from 'react';

/** How long a toast stays visible. */
const TOAST_DURATION_MS = 4000;

/**
 * Returns the current toast text (or null) and a function to show a new one.
 * Showing a new toast restarts the timer, so messages never overlap.
 */
export function useToast(): [string | null, (message: string) => void] {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  function showToast(text: string) {
    setMessage(text);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setMessage(null);
    }, TOAST_DURATION_MS);
  }

  return [message, showToast];
}
