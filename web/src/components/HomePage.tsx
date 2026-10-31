/**
 * @fileoverview The interactive home page. Owns the page-level state
 * (filters, open dialog, toast) and wires the smaller components together.
 * It contains no layout details of its own; those live in each component.
 *
 * Why a separate client component: `app/page.tsx` is a server component
 * that loads the first page of courses from the database. Anything that
 * reacts to clicks must run in the browser, which requires 'use client'.
 *
 * Search, filters and sort run on the server: when a control changes, this
 * component asks `/api/courses` for new results (see lib/catalog-api.ts).
 */

'use client';

import {useRouter} from 'next/navigation';
import {useEffect, useMemo, useRef, useState} from 'react';
import {toggleSaved, useOwnListings, useSavedIds} from '@/lib/browser-storage';
import {fetchCourses, toCourseQuery} from '@/lib/catalog-api';
import {courseQueryToParams} from '@/lib/course-query-params';
import {filterCourses, sortCourses} from '@/lib/filter-courses';
import {
  DEFAULT_FILTERS,
  type CatalogFilters,
  type Course,
  type Viewer,
} from '@/lib/types';
import {PAGE_CHANGE_SCROLL, SEARCH_DEBOUNCE_MS} from '@/config/catalog';
import {scrollBelowHeader} from '@/lib/scroll';
import {useIsOffscreen} from '@/lib/use-is-offscreen';
import {useToast} from '@/lib/use-toast';
import {BookingForm} from './BookingForm';
import {CatalogGrid} from './CatalogGrid';
import {CourseDetail} from './CourseDetail';
import {FilterSidebar} from './FilterSidebar';
import {Hero} from './Hero';
import {ListingForm} from './ListingForm';
import {Modal} from './Modal';
import {RequestList} from './RequestList';
import {SiteFooter, TrainerBanner} from './SiteFooter';
import {SiteHeader} from './SiteHeader';

/** Which dialog is open, plus the data it needs. `null` means none. */
type OpenDialog =
  | {kind: 'detail'; course: Course}
  | {kind: 'booking'; course: Course}
  | {kind: 'listing'}
  | {kind: 'requests'}
  | null;

/** Sticky header height in px (desktop); matches `header` in globals.css. */
const HEADER_HEIGHT_PX = 64;

const DIALOG_TITLES = {
  detail: 'Explore this training',
  booking: 'Request training',
  listing: 'Share your expertise',
  requests: 'My booking requests',
} as const;

interface HomePageProps {
  /** Courses matching {@link DEFAULT_FILTERS}, loaded by the server. */
  initialCourses: Course[];
  /** Suggested topics for the listing form, loaded by the server. */
  categories: string[];
  /** The signed-in visitor, or null for guests. */
  viewer: Viewer | null;
}

/** Identifies a server query, so the same search is never sent twice in a row. */
function queryKey(filters: CatalogFilters, savedIds: number[]): string {
  return courseQueryToParams(toCourseQuery(filters, savedIds)).toString();
}

/** Home page: header, hero, catalog, banner, footer and dialogs. */
export function HomePage({initialCourses, categories, viewer}: HomePageProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<CatalogFilters>(DEFAULT_FILTERS);
  const [dialog, setDialog] = useState<OpenDialog>(null);
  const [toast, showToast] = useToast();
  const [page, setPage] = useState(1);
  const catalogTitleRef = useRef<HTMLHeadingElement>(null);
  // Zero-height marker at the line between the search area and the catalog.
  const catalogStartRef = useRef<HTMLDivElement>(null);
  const heroSearchRef = useRef<HTMLDivElement>(null);
  const heroSearchHidden = useIsOffscreen(heroSearchRef, HEADER_HEIGHT_PX);
  const savedIds = useSavedIds();
  const ownListings = useOwnListings();

  const [serverCourses, setServerCourses] = useState(initialCourses);
  // The server already answered the default query; start from that.
  const lastQueryKey = useRef(queryKey(DEFAULT_FILTERS, []));

  // Ask the server again when the query changes. Saved ids only matter on
  // the Saved tab, so saving a course elsewhere does not trigger a search.
  const savedIdsForQuery = filters.savedOnly ? savedIds : [];
  const currentQueryKey = queryKey(filters, savedIdsForQuery);
  useEffect(() => {
    if (currentQueryKey === lastQueryKey.current) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetchCourses(toCourseQuery(filters, savedIdsForQuery), controller.signal)
        .then((courses) => {
          lastQueryKey.current = currentQueryKey;
          setServerCourses(courses);
        })
        .catch((error: unknown) => {
          // A newer query replaced this one; not a real failure.
          if (controller.signal.aborted) return;
          console.error(error);
          showToast('Could not load trainings. Please try again.');
        });
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
    // Only the key decides whether to search; `filters` and the ids are
    // fully described by it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQueryKey]);

  // useMemo: only recompute when an input changes, not on every render
  // (e.g. opening a dialog should not re-sort the catalog).
  // Browser-only listings are filtered here, then merged with the server's
  // results; "recommended" keeps the browser listings first.
  const visibleCourses = useMemo(
    () =>
      sortCourses(
        [...filterCourses(ownListings, filters, savedIds), ...serverCourses],
        filters.sort,
      ),
    [ownListings, filters, savedIds, serverCourses],
  );

  // Any filter change goes back to page 1, so results never start on an
  // empty page. All filter updates go through these two functions.
  function updateFilters(patch: Partial<CatalogFilters>) {
    setFilters((current) => ({...current, ...patch}));
    setPage(1);
  }

  function resetFilters(next: CatalogFilters) {
    setFilters(next);
    setPage(1);
  }

  /**
   * Runs `action` only for signed-in users with a profile. Guests go to
   * sign-in (and come back here); users without a profile go to onboarding.
   */
  function withAccount(action: () => void) {
    if (!viewer) router.push('/sign-in?next=/');
    else if (!viewer.profile) router.push('/onboarding');
    else action();
  }

  /** Opens the listing form for trainers; explains the rule to schools. */
  function openListingForm() {
    withAccount(() => {
      if (viewer?.profile?.role === 'trainer') setDialog({kind: 'listing'});
      else showToast('Only trainer accounts can list training.');
    });
  }

  function scrollToCatalog() {
    catalogTitleRef.current?.scrollIntoView({behavior: 'smooth', block: 'center'});
  }

  function showCatalog(savedOnly: boolean) {
    updateFilters({savedOnly});
    scrollToCatalog();
  }

  return (
    <>
      <SiteHeader
        savedOnly={filters.savedOnly}
        savedCount={savedIds.length}
        viewer={viewer}
        onShowSaved={() => {
          // Toggle: a second click returns to all trainings.
          withAccount(() => {
            showCatalog(!filters.savedOnly);
          });
        }}
        onShowRequests={() => {
          withAccount(() => {
            setDialog({kind: 'requests'});
          });
        }}
        onListTraining={openListingForm}
        showSearch={heroSearchHidden}
        query={filters.query}
        onQueryChange={(query) => {
          updateFilters({query});
        }}
        onSearch={scrollToCatalog}
      />

      <Hero
        query={filters.query}
        onQueryChange={(query) => {
          updateFilters({query});
        }}
        onSearch={scrollToCatalog}
        searchRef={heroSearchRef}
        artCourse={
          initialCourses.find((c) => c.type === 'classroom') ?? initialCourses[0]
        }
      />

      <div ref={catalogStartRef} aria-hidden="true" />
      <main className="main">
        <div className="title-row">
          <div>
            <h2 ref={catalogTitleRef}>
              {filters.savedOnly
                ? 'Your saved training'
                : 'Find your next lightbulb moment'}
            </h2>
            <p>
              Explore workshops, courses, and coaching for every stage of your teaching
              journey.
            </p>
          </div>
        </div>

        <div className="catalog">
          <FilterSidebar
            filters={filters}
            onChange={updateFilters}
            onClearAll={() => {
              // Keep the Saved tab active; only reset the filters.
              resetFilters({...DEFAULT_FILTERS, savedOnly: filters.savedOnly});
            }}
          />
          <CatalogGrid
            courses={visibleCourses}
            savedIds={savedIds}
            sort={filters.sort}
            savedOnly={filters.savedOnly}
            onSortChange={(sort) => {
              updateFilters({sort});
            }}
            page={page}
            onPageChange={(next) => {
              setPage(next);
              if (PAGE_CHANGE_SCROLL === 'catalog-top' && catalogStartRef.current) {
                scrollBelowHeader(catalogStartRef.current);
              }
            }}
            onShowAll={() => {
              updateFilters({savedOnly: false});
            }}
            onOpenCourse={(course) => {
              setDialog({kind: 'detail', course});
            }}
            onToggleSave={(courseId) => {
              withAccount(() => {
                toggleSaved(courseId);
              });
            }}
            onClearFilters={() => {
              resetFilters(DEFAULT_FILTERS);
            }}
          />
        </div>

        <TrainerBanner onListTraining={openListingForm} />
      </main>

      <SiteFooter />

      {dialog && (
        // `key` gives each dialog kind a fresh <dialog> element, so going
        // from "detail" to "booking" closes one and opens the other cleanly.
        <Modal
          key={dialog.kind}
          title={DIALOG_TITLES[dialog.kind]}
          onClose={() => {
            setDialog(null);
          }}
        >
          {dialog.kind === 'detail' && (
            <CourseDetail
              course={dialog.course}
              onRequest={() => {
                withAccount(() => {
                  setDialog({kind: 'booking', course: dialog.course});
                });
              }}
            />
          )}
          {dialog.kind === 'booking' && (
            <BookingForm
              course={dialog.course}
              onSubmitted={() => {
                setDialog(null);
                showToast('Request saved. View it in My requests.');
              }}
              onError={showToast}
            />
          )}
          {dialog.kind === 'listing' && (
            <ListingForm
              categories={categories}
              onSubmitted={() => {
                // Clear filters so the new listing is visible at the top.
                resetFilters(DEFAULT_FILTERS);
                setDialog(null);
                showToast('Your training was added to this browser’s catalog.');
              }}
              onError={showToast}
            />
          )}
          {dialog.kind === 'requests' && <RequestList />}
        </Modal>
      )}

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </>
  );
}
