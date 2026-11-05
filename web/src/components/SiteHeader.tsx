/**
 * @fileoverview Top navigation bar, shown on every page. Sticky (see
 * `header` in globals.css) so it stays visible while scrolling. Shows
 * "Sign in" for guests and "Account" for signed-in users.
 *
 * On the home page it also has a compact search box (fades in when the hero
 * search scrolls away) and opens dialogs directly. On other pages there is
 * no search, and "My requests" / "List your training" link to the home
 * page, which opens the matching dialog (`/?open=...`, see HomePage.tsx).
 * Other pages use it through `PageHeader.tsx`.
 *
 * On phones the nav buttons hide behind a ☰ menu button (CSS shows the
 * button only below 730px; the open state is ignored on larger screens).
 */

'use client';

import Link from 'next/link';
import {useState} from 'react';

import {SITE, SITE_NAME} from '@/config/site';
import type {Viewer} from '@/lib/types';
import {SearchBox} from './SearchBox';

/** Home-page links that open a dialog after navigating there. */
export const OPEN_REQUESTS_HREF = '/?open=requests';
export const OPEN_LISTING_HREF = '/?open=listing';

/** Compact search box settings (home page only). */
interface HeaderSearch {
  /** Show the box (true once the hero search is off-screen). */
  show: boolean;
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: () => void;
}

interface SiteHeaderProps {
  /**
   * The signed-in visitor, null for guests, or undefined while still
   * loading (account links are then hidden, so they do not flicker).
   */
  viewer: Viewer | null | undefined;
  /** Omitted on pages other than home: no search box. */
  search?: HeaderSearch;
  /** Omitted on other pages: "My requests" becomes a link to home. */
  onShowRequests?: () => void;
  /** Omitted on other pages: "List your training" becomes a link to home. */
  onListTraining?: () => void;
}

/** Brand logo plus the main navigation. */
export function SiteHeader({
  viewer,
  search,
  onShowRequests,
  onListTraining,
}: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  /** Runs a nav action and closes the phone menu. */
  function choose(action: () => void) {
    return () => {
      setMenuOpen(false);
      action();
    };
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  const headerClass = [search?.show ? 'with-search' : '', menuOpen ? 'menu-open' : '']
    .filter((name) => name !== '')
    .join(' ');

  return (
    <header className={headerClass}>
      <Link className="brand" href="/" aria-label={`${SITE_NAME} home`}>
        <span className="logo">✧</span>
        <span className="brand-name">
          {SITE.nameStart}
          <b>{SITE.nameEnd}</b>
        </span>
        <span className="demo">{SITE.stageLabel}</span>
      </Link>
      {search && (
        // Always rendered so it can animate; hidden from keyboard and screen
        // readers while invisible (inert).
        <div className="header-search" inert={!search.show}>
          <SearchBox
            variant="compact"
            query={search.query}
            onQueryChange={search.onQueryChange}
            onSearch={search.onSearch}
          />
        </div>
      )}
      <button
        className="menu-toggle"
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
        aria-controls="main-nav"
        onClick={() => {
          setMenuOpen(!menuOpen);
        }}
      >
        {menuOpen ? '✕' : '☰'}
      </button>
      <nav id="main-nav">
        {/* Guests only see Sign in and List your training. */}
        {viewer && (
          <>
            {onShowRequests ? (
              <button onClick={choose(onShowRequests)}>My requests</button>
            ) : (
              <Link href={OPEN_REQUESTS_HREF} onClick={closeMenu}>
                My requests
              </Link>
            )}
          </>
        )}
        {viewer && (
          <Link href={viewer.profile ? '/account' : '/onboarding'} onClick={closeMenu}>
            Account
          </Link>
        )}
        {viewer === null && (
          <Link href="/sign-in" onClick={closeMenu}>
            Sign in
          </Link>
        )}
        {onListTraining ? (
          <button className="btn small" onClick={choose(onListTraining)}>
            + List your training
          </button>
        ) : (
          <Link className="btn small" href={OPEN_LISTING_HREF} onClick={closeMenu}>
            + List your training
          </Link>
        )}
      </nav>
    </header>
  );
}
