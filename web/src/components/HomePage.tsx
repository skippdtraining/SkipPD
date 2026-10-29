/**
 * @fileoverview The interactive home page. Owns the page-level state
 * (filters, open dialog, toast) and wires the smaller components together.
 * It contains no layout details of its own; those live in each component.
 *
 * Why a separate client component: `app/page.tsx` is a server component
 * (it will load courses from the database in Step 3). Anything that reacts
 * to clicks must run in the browser, which requires 'use client'.
 */

'use client';

import {useMemo, useRef, useState} from 'react';
import {toggleSaved, useOwnListings, useSavedIds} from '@/lib/browser-storage';
import {filterCourses} from '@/lib/filter-courses';
import {DEFAULT_FILTERS, type CatalogFilters, type Course} from '@/lib/types';
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
  /** Catalog courses supplied by the server (sample data until Step 3). */
  courses: Course[];
}

/** Home page: header, hero, catalog, banner, footer and dialogs. */
export function HomePage({courses}: HomePageProps) {
  const [filters, setFilters] = useState<CatalogFilters>(DEFAULT_FILTERS);
  const [dialog, setDialog] = useState<OpenDialog>(null);
  const [toast, showToast] = useToast();
  const catalogTitleRef = useRef<HTMLHeadingElement>(null);
  const heroSearchRef = useRef<HTMLDivElement>(null);
  const heroSearchHidden = useIsOffscreen(heroSearchRef, HEADER_HEIGHT_PX);
  const savedIds = useSavedIds();
  const ownListings = useOwnListings();

  // useMemo: only recompute when an input changes, not on every render
  // (e.g. opening a dialog should not re-filter the catalog).
  const allCourses = useMemo(() => [...ownListings, ...courses], [ownListings, courses]);
  const visibleCourses = useMemo(
    () => filterCourses(allCourses, filters, savedIds),
    [allCourses, filters, savedIds],
  );

  function updateFilters(patch: Partial<CatalogFilters>) {
    setFilters((current) => ({...current, ...patch}));
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
        onExplore={() => {
          showCatalog(false);
        }}
        onShowSaved={() => {
          showCatalog(true);
        }}
        onShowRequests={() => {
          setDialog({kind: 'requests'});
        }}
        onListTraining={() => {
          setDialog({kind: 'listing'});
        }}
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
        artCourse={courses.find((c) => c.type === 'classroom') ?? courses[0]}
      />

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
              setFilters({...DEFAULT_FILTERS, savedOnly: filters.savedOnly});
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
            onOpenCourse={(course) => {
              setDialog({kind: 'detail', course});
            }}
            onToggleSave={(courseId) => {
              toggleSaved(courseId);
            }}
            onClearFilters={() => {
              setFilters(DEFAULT_FILTERS);
            }}
          />
        </div>

        <TrainerBanner
          onListTraining={() => {
            setDialog({kind: 'listing'});
          }}
        />
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
                setDialog({kind: 'booking', course: dialog.course});
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
              onSubmitted={() => {
                // Clear filters so the new listing is visible at the top.
                setFilters(DEFAULT_FILTERS);
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
