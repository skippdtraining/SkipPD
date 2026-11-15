/**
 * @fileoverview Route for "/my-listings": a trainer's own listings (hidden
 * ones included) with the create / edit form. The list is read on the
 * server; the interactive part lives in `components/MyListings.tsx`.
 * Next.js requires a default export.
 */

import type {Metadata} from 'next';
import Link from 'next/link';
import {redirect} from 'next/navigation';
import {Suspense} from 'react';
import {MyListings} from '@/components/MyListings';
import {PageHeader} from '@/components/PageHeader';
import {SiteFooter} from '@/components/SiteFooter';
import {SITE_NAME} from '@/config/site';
import {getCourseRepository} from '@/lib/data/course-repository';
import {getListingRepository} from '@/lib/data/listing-repository';
import type {Course} from '@/lib/types';
import {getViewer} from '@/lib/viewer';

export const metadata: Metadata = {title: `My listings | ${SITE_NAME}`};

/** Session checks, then the trainer's listings and the listing form. */
async function MyListingsContent({searchParams}: PageProps<'/my-listings'>) {
  const viewer = await getViewer();
  if (!viewer) redirect('/sign-in?next=/my-listings');
  if (viewer.isAdmin) redirect('/admin');
  if (!viewer.profile) redirect('/onboarding');

  // Only trainers may list training; schools get told so instead of a form.
  if (viewer.profile.role !== 'trainer') {
    return (
      <section className="my-listings-notice">
        <h1>My listings</h1>
        <p>Only trainer accounts can list training.</p>
        <Link className="btn small" href="/">
          ← Back to trainings
        </Link>
      </section>
    );
  }

  const startNew = (await searchParams).new === '1';

  // Load outside try/catch (JSX must not be built inside one): a missing
  // migration 0011 shows its real message instead of a crash page.
  let listings: Course[];
  let categories: string[];
  try {
    [listings, categories] = await Promise.all([
      getListingRepository().listMyListings(viewer.id),
      getCourseRepository().listCategories(),
    ]);
  } catch (error) {
    console.error(error);
    const detail =
      error instanceof Error && error.message
        ? error.message
        : 'Could not load your listings. Please try again.';
    return (
      <section className="my-listings-notice">
        <h1>My listings</h1>
        <p className="form-error" role="alert">
          {detail}
        </p>
        <p className="small-text">
          If this mentions a missing column or table, run migration
          <code> supabase/migrations/0011_listings_owner.sql</code> in the Supabase SQL
          Editor.
        </p>
        <Link className="btn small" href="/">
          ← Back to trainings
        </Link>
      </section>
    );
  }

  return <MyListings listings={listings} categories={categories} startNew={startNew} />;
}

export default function MyListingsPage(props: PageProps<'/my-listings'>) {
  return (
    <>
      <PageHeader />
      <main className="my-listings-page">
        <Suspense>
          <MyListingsContent {...props} />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
