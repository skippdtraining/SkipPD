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
  /**
   * Year in the footer copyright line. A fixed value, because Next.js
   * pre-renders pages and does not allow reading the current date there.
   */
  copyrightYear: 2026,
  footerTagline: 'A place for educators to grow, together.',
} as const;

/** A link in the site footer. */
export interface FooterLink {
  label: string;
  /** URL path of the page, e.g. "/about". */
  href: string;
}

/**
 * Footer link columns. Add, rename or remove links here; the footer and the
 * placeholder pages (app/[slug] routes) both read this list.
 */
export const FOOTER_COLUMNS: Array<{title: string; links: FooterLink[]}> = [
  {
    title: 'Company',
    links: [
      {label: 'About Us', href: '/about'},
      {label: 'How it works', href: '/how-it-works'},
      {label: 'Contact Us', href: '/contact'},
    ],
  },
  {
    title: 'Support',
    links: [{label: 'FAQ', href: '/faq'}],
  },
  {
    title: 'Legal',
    links: [
      {label: 'Terms of Service', href: '/terms'},
      {label: 'Privacy Policy', href: '/privacy'},
    ],
  },
];

/** Full brand name, e.g. "SkipPD". */
export const SITE_NAME = `${SITE.nameStart}${SITE.nameEnd}`;
