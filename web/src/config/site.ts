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
      {label: 'Blog', href: '/blog'},
    ],
  },
  {
    title: 'Support',
    links: [
      {label: 'FAQ', href: '/faq'},
      {label: 'Contact Us', href: '/contact'},
    ],
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

/** A social media profile shown as an icon in the footer. */
export interface SocialLink {
  /** Accessible name, e.g. "LinkedIn". */
  label: string;
  /** Which icon to draw (see components/SocialIcon.tsx). */
  icon: 'linkedin' | 'instagram' | 'facebook' | 'x';
  /**
   * Profile URL. PLACEHOLDER: these point to the platforms' home pages until
   * the SkipPD accounts exist; replace with the real profile URLs.
   */
  href: string;
}

/** Footer social icons, in display order. Remove an entry to hide its icon. */
export const SOCIAL_LINKS: SocialLink[] = [
  {label: 'LinkedIn', icon: 'linkedin', href: 'https://www.linkedin.com/'},
  {label: 'Instagram', icon: 'instagram', href: 'https://www.instagram.com/'},
  {label: 'Facebook', icon: 'facebook', href: 'https://www.facebook.com/'},
  {label: 'X', icon: 'x', href: 'https://x.com/'},
];
