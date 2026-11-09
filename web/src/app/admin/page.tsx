/**
 * @fileoverview Route for "/admin": the review queue. Admins approve or
 * reject trainer certificates, teaching licenses and school accounts.
 * Loads the queue on the server; tabs, table/tiles and pages are in
 * components/AdminQueue.tsx.
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
import {AdminQueue} from '@/components/AdminQueue';
import {SiteFooter} from '@/components/SiteFooter';
import {SITE_NAME} from '@/config/site';
import {getAdminRepository} from '@/lib/data/admin-repository';
import {getViewer} from '@/lib/viewer';

export const metadata: Metadata = {title: `Admin | ${SITE_NAME}`};

/** Checks the admin flag, then shows the queue. */
async function AdminContent({searchParams}: PageProps<'/admin'>) {
  const viewer = await getViewer();
  if (!viewer) redirect('/sign-in?next=/admin');
  if (!viewer.isAdmin) notFound();

  const requests = await getAdminRepository().listPendingReviews();

  return (
    <>
      <div className="admin-top">
        <div>
          <h1>Review queue</h1>
          <p>
            Signed in as {viewer.email}. {requests.length} request
            {requests.length === 1 ? '' : 's'} pending.
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
      <AdminQueue requests={requests} />
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
