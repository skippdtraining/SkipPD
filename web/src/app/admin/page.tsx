/**
 * @fileoverview Route for "/admin": the review queue. Admins approve or
 * reject trainer certificates, teaching licenses and school accounts.
 *
 * Non-admins get a 404, so the page's existence is not advertised. Admin
 * accounts are created in the SQL Editor (docs/HOW-TO.md, "Create the admin
 * account"). Next.js requires a default export.
 */

import type {Metadata} from 'next';
import {notFound, redirect} from 'next/navigation';
import {Suspense} from 'react';
import {signOutAction} from '@/app/actions/auth';
import {PageHeader} from '@/components/PageHeader';
import {ReviewCard} from '@/components/ReviewCard';
import {SiteFooter} from '@/components/SiteFooter';
import {SITE_NAME} from '@/config/site';
import {getAdminRepository} from '@/lib/data/admin-repository';
import type {ReviewItem, ReviewRequest} from '@/lib/types';
import {getViewer} from '@/lib/viewer';

export const metadata: Metadata = {title: `Admin | ${SITE_NAME}`};

/** Queue sections, in display order. */
const SECTIONS: {item: ReviewItem; title: string}[] = [
  {item: 'school', title: 'Schools to verify'},
  {item: 'certification', title: 'Certificates to review'},
  {item: 'license', title: 'Teaching licenses to check'},
];

/** Checks the admin flag, then shows the queue. */
async function AdminContent({searchParams}: PageProps<'/admin'>) {
  const viewer = await getViewer();
  if (!viewer) redirect('/sign-in?next=/admin');
  if (!viewer.isAdmin) notFound();

  const requests = await getAdminRepository().listPendingReviews();
  const byItem = (item: ReviewItem): ReviewRequest[] =>
    requests.filter((request) => request.item === item);

  return (
    <>
      <div className="admin-top">
        <div>
          <h1>Review queue</h1>
          <p>
            Signed in as {viewer.email}. {requests.length} item
            {requests.length === 1 ? '' : 's'} waiting.
          </p>
        </div>
        <form action={signOutAction}>
          <button className="btn light small">Sign out</button>
        </form>
      </div>
      {(await searchParams).file === 'missing' && (
        <p className="form-error" role="alert">
          That user has no certificate file anymore. Reload the page.
        </p>
      )}
      {SECTIONS.map(({item, title}) => (
        <section key={item} className="admin-section">
          <h2>
            {title} <span className="admin-count">{byItem(item).length}</span>
          </h2>
          {byItem(item).length === 0 ? (
            <p className="admin-empty">Nothing waiting.</p>
          ) : (
            <div className="review-grid">
              {byItem(item).map((request) => (
                <ReviewCard key={`${request.item}-${request.userId}`} request={request} />
              ))}
            </div>
          )}
        </section>
      ))}
    </>
  );
}

export default function AdminPage(props: PageProps<'/admin'>) {
  return (
    <>
      <PageHeader />
      <main className="admin-page">
        <Suspense fallback={<p>Loading…</p>}>
          <AdminContent {...props} />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
