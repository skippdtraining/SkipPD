/**
 * @fileoverview The site header for every page except home: same look and
 * links as on the home page, without the search box.
 *
 * Server component: it looks up the visitor itself, so pages only write
 * `<PageHeader />`. Reading the session needs request data, so it streams
 * in behind Suspense; meanwhile the header shows without account links.
 */

import {Suspense} from 'react';
import {getViewer} from '@/lib/viewer';
import {SiteHeader} from './SiteHeader';

/** Header with the visitor's account links. */
async function HeaderWithViewer() {
  return <SiteHeader viewer={await getViewer()} />;
}

/** Site header for pages other than home. */
export function PageHeader() {
  return (
    <Suspense fallback={<SiteHeader viewer={undefined} />}>
      <HeaderWithViewer />
    </Suspense>
  );
}
