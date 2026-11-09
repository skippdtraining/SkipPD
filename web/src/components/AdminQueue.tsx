/**
 * @fileoverview Interactive part of the admin page: category tabs (schools,
 * certificates, licenses), a tiles / table switch, and pages of at most
 * ADMIN_REVIEWS_PER_PAGE items, like the home page catalog.
 *
 * Why client-side: the queue is loaded once by the server (app/admin/page.tsx);
 * switching tab, view or page only changes what is shown.
 */

'use client';

import {useState} from 'react';
import {ADMIN_REVIEWS_PER_PAGE} from '@/config/accounts';
import type {ReviewItem, ReviewRequest} from '@/lib/types';
import {Pagination} from './Pagination';
import {ReviewCard} from './ReviewCard';
import {ReviewTable} from './ReviewTable';

/** Tabs, in display order. */
const TABS: {item: ReviewItem; label: string}[] = [
  {item: 'school', label: 'Schools'},
  {item: 'certification', label: 'Certificates'},
  {item: 'license', label: 'Licenses'},
];

type ViewMode = 'table' | 'tiles';

interface AdminQueueProps {
  /** Every pending item, oldest first. */
  requests: ReviewRequest[];
}

/** Tabs + view switch + one page of review items. */
export function AdminQueue({requests}: AdminQueueProps) {
  const [tab, setTab] = useState<ReviewItem>('school');
  const [view, setView] = useState<ViewMode>('table');
  const [page, setPage] = useState(1);

  const inTab = requests.filter((request) => request.item === tab);
  const pageCount = Math.max(1, Math.ceil(inTab.length / ADMIN_REVIEWS_PER_PAGE));
  // Clamp: approving the last item on the last page leaves fewer pages.
  const currentPage = Math.min(page, pageCount);
  const pageItems = inTab.slice(
    (currentPage - 1) * ADMIN_REVIEWS_PER_PAGE,
    currentPage * ADMIN_REVIEWS_PER_PAGE,
  );

  return (
    <>
      <div className="admin-toolbar">
        <div className="admin-tabs" role="tablist" aria-label="Review categories">
          {TABS.map(({item, label}) => {
            const count = requests.filter((request) => request.item === item).length;
            return (
              <button
                key={item}
                role="tab"
                aria-selected={tab === item}
                className={`admin-tab ${tab === item ? 'active' : ''}`}
                onClick={() => {
                  setTab(item);
                  setPage(1);
                }}
              >
                {label} <span className="admin-count">{count}</span>
              </button>
            );
          })}
        </div>
        <div className="view-switch" role="group" aria-label="Display as">
          {(['table', 'tiles'] as const).map((mode) => (
            <button
              key={mode}
              className={view === mode ? 'active' : ''}
              aria-pressed={view === mode}
              aria-label={mode === 'table' ? 'Show as table' : 'Show as tiles'}
              title={mode === 'table' ? 'Table' : 'Tiles'}
              onClick={() => {
                setView(mode);
              }}
            >
              {mode === 'table' ? '☰' : '▦'}
            </button>
          ))}
        </div>
      </div>

      <p className="admin-showing">
        Showing page <b>{currentPage}</b> of <b>{pageCount}</b> · Total:{' '}
        <b>{inTab.length}</b>
      </p>

      <div role="tabpanel">
        {inTab.length === 0 ? (
          <p className="admin-empty">Nothing waiting.</p>
        ) : view === 'table' ? (
          <ReviewTable requests={pageItems} />
        ) : (
          <div className="review-grid">
            {pageItems.map((request) => (
              <ReviewCard key={`${request.item}-${request.userId}`} request={request} />
            ))}
          </div>
        )}
      </div>

      <Pagination
        page={currentPage}
        pageCount={pageCount}
        onPageChange={setPage}
        label="Review pages"
      />
    </>
  );
}
