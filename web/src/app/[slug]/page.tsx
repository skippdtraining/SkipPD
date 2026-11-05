/**
 * @fileoverview Temporary "Coming soon" page for every footer link
 * (/about, /terms, /contact, ...).
 *
 * Why one dynamic route: the pages' content is not decided yet. This route
 * builds one page per link in FOOTER_COLUMNS (config/site.ts), so adding a
 * footer link automatically creates its placeholder. When a page gets real
 * content, create a dedicated folder for it (e.g. `app/about/page.tsx`);
 * Next.js prefers that over this catch-all route.
 *
 * Next.js requires default exports in route files (see docs/CONVENTIONS.md).
 */

import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {PageHeader} from '@/components/PageHeader';
import {SiteFooter} from '@/components/SiteFooter';
import {FOOTER_COLUMNS, SITE_NAME, type FooterLink} from '@/config/site';

/** Finds the footer link whose path is "/<slug>". */
function findLink(slug: string): FooterLink | undefined {
  return FOOTER_COLUMNS.flatMap((column) => column.links).find(
    (link) => link.href === `/${slug}`,
  );
}

/**
 * Footer paths that already have their own route folder (e.g. app/support).
 * Skipped here so Next.js does not build a second, unused page for them.
 * (Next.js prefers the dedicated folder anyway, so a missing entry only
 * wastes a build step; it does not break the page.)
 */
const PATHS_WITH_OWN_PAGE = new Set(['/support']);

/** Tells Next.js which pages to build ahead of time: one per footer link. */
export function generateStaticParams() {
  return FOOTER_COLUMNS.flatMap((column) => column.links)
    .filter((link) => !PATHS_WITH_OWN_PAGE.has(link.href))
    .map((link) => ({slug: link.href.slice(1)}));
}

export async function generateMetadata({
  params,
}: PageProps<'/[slug]'>): Promise<Metadata> {
  const link = findLink((await params).slug);
  return {title: link ? `${link.label} | ${SITE_NAME}` : SITE_NAME};
}

export default async function PlaceholderPage({params}: PageProps<'/[slug]'>) {
  const link = findLink((await params).slug);
  // Unknown paths (not in the footer list) show the 404 page.
  if (!link) notFound();

  return (
    <>
      <PageHeader />
      <main className="placeholder-page">
        <div className="eyebrow">Coming soon</div>
        <h1>{link.label}</h1>
        <p>This page is being written. Please check back soon.</p>
        <Link className="btn" href="/">
          ← Back to {SITE_NAME}
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
