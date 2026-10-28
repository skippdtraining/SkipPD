/**
 * @fileoverview Root layout: the `<html>` and `<body>` wrapper shared by
 * every page. Loads fonts, global CSS and the page title / description
 * that search engines and browser tabs show.
 *
 * Next.js requires a default export here (see docs/CONVENTIONS.md).
 */

import type {Metadata} from 'next';
import {DM_Sans, Manrope} from 'next/font/google';
import './globals.css';

// next/font downloads the fonts at build time and serves them from our own
// domain: faster, no layout shift, and no request to Google from the browser.
// Each font is exposed as a CSS variable used in globals.css.
const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});
const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'SkipPD | Great teachers never stop learning',
  description:
    "Discover professional development led by educators. Find workshops, connect with trainers, and plan your school's next PD day.",
};

export default function RootLayout({children}: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${manrope.variable}`}>
      <body>{children}</body>
    </html>
  );
}
