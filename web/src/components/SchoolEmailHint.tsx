/**
 * @fileoverview Small coloured label telling the admin whether a school
 * account's email looks like a school address. Used in tiles and the table.
 */

interface SchoolEmailHintProps {
  /** True when the email matched the school patterns or domain list. */
  likely: boolean;
}

/** "School email" (green) or "Not a known school email" (red). */
export function SchoolEmailHint({likely}: SchoolEmailHintProps) {
  return (
    <span className={likely ? 'hint-good' : 'hint-warn'}>
      {likely ? 'School email' : 'Not a known school email'}
    </span>
  );
}
