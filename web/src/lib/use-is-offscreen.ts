/**
 * @fileoverview React hook that reports whether an element has scrolled out
 * of view. Used to show the compact header search once the hero search box
 * is no longer visible.
 *
 * Why IntersectionObserver: the browser tells us when visibility changes,
 * instead of us running code on every scroll event (smoother, less battery).
 */

'use client';

import {useEffect, useState, type RefObject} from 'react';

/**
 * @param ref Element to watch.
 * @param topOffsetPx Height covered at the top of the screen (the sticky
 *     header), so "hidden behind the header" also counts as off-screen.
 */
export function useIsOffscreen(
  ref: RefObject<HTMLElement | null>,
  topOffsetPx: number,
): boolean {
  const [offscreen, setOffscreen] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setOffscreen(!entry.isIntersecting);
      },
      {rootMargin: `-${topOffsetPx}px 0px 0px 0px`},
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [ref, topOffsetPx]);

  return offscreen;
}
