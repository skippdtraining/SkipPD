/**
 * @fileoverview Site-wide branding and text settings.
 *
 * Why this exists: the product name, tagline and SEO text appear in several
 * components. Keeping them here means a rename or rebrand is one edit.
 */

export const SITE = {
  /** Brand name split in two so the second part can be coloured. */
  nameStart: 'Skip',
  nameEnd: 'PD',
  /** Small label next to the logo while the product is not live. */
  stageLabel: 'Preview',
  /** Browser tab title. */
  title: 'SkipPD | Great teachers never stop learning',
  /** Search-engine description. */
  description:
    "Discover professional development led by educators. Find workshops, connect with trainers, and plan your school's next PD day.",
  footerTagline: 'A place for educators to grow, together.',
} as const;

/** Full brand name, e.g. "SkipPD". */
export const SITE_NAME = `${SITE.nameStart}${SITE.nameEnd}`;
