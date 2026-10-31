/**
 * @fileoverview Top navigation bar. Sticky (see `header` in globals.css) so
 * it stays visible while scrolling. Shows "Sign in" for guests and
 * "Account" for signed-in users.
 *
 * When the hero search box scrolls away, a compact copy of it fades in here
 * so search is always one tap away.
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

interface SiteHeaderProps {
  /** True when the "Saved" view is active; clicking Saved again returns to all trainings. */
  savedOnly: boolean;
  savedCount: number;
  /** The signed-in visitor, or null for guests. */
  viewer: Viewer | null;
  onShowSaved: () => void;
  onShowRequests: () => void;
  onListTraining: () => void;
  /** Show the compact search (true once the hero search is off-screen). */
  showSearch: boolean;
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: () => void;
}

/** Brand logo plus the main navigation buttons. */
export function SiteHeader({
  savedOnly,
  savedCount,
  viewer,
  onShowSaved,
  onShowRequests,
  onListTraining,
  showSearch,
  query,
  onQueryChange,
  onSearch,
}: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  /** Runs a nav action and closes the phone menu. */
  function choose(action: () => void) {
    return () => {
      setMenuOpen(false);
      action();
    };
  }

  const headerClass = [showSearch ? 'with-search' : '', menuOpen ? 'menu-open' : '']
    .filter((name) => name !== '')
    .join(' ');

  return (
    <header className={headerClass}>
      <a className="brand" href="./" aria-label={`${SITE_NAME} home`}>
        <span className="logo">✧</span>
        <span className="brand-name">
          {SITE.nameStart}
          <b>{SITE.nameEnd}</b>
        </span>
        <span className="demo">{SITE.stageLabel}</span>
      </a>
      {/* Always rendered so it can animate; hidden from keyboard and screen
          readers while invisible (inert). */}
      <div className="header-search" inert={!showSearch}>
        <SearchBox
          variant="compact"
          query={query}
          onQueryChange={onQueryChange}
          onSearch={onSearch}
        />
      </div>
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
            <button
              className={savedOnly ? 'nav-active' : ''}
              aria-pressed={savedOnly}
              onClick={choose(onShowSaved)}
            >
              Saved <span className="saved-count">{savedCount}</span>
            </button>
            <button onClick={choose(onShowRequests)}>My requests</button>
          </>
        )}
        {viewer ? (
          <Link href={viewer.profile ? '/account' : '/onboarding'}>Account</Link>
        ) : (
          <Link href="/sign-in">Sign in</Link>
        )}
        <button className="btn small" onClick={choose(onListTraining)}>
          + List your training
        </button>
      </nav>
    </header>
  );
}
