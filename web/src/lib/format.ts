/**
 * @fileoverview Small display-formatting helpers shared by components.
 * Kept separate from data and filtering logic so they can be reused anywhere.
 */

import {GRADES, type Grade} from './types';

/** First letters of the first two words, e.g. "Sarah Mitchell" -> "SM". */
export function initials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('');
}

/** "All grades" when every band is covered, otherwise e.g. "K–5, 6–8". */
export function gradeLabel(grades: Grade[]): string {
  return grades.length === GRADES.length ? 'All grades' : grades.join(', ');
}

/** Formats a USD amount, e.g. 79 -> "$79". */
export function formatPrice(amountUsd: number): string {
  return `$${amountUsd}`;
}
