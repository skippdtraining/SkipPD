/**
 * @fileoverview Top navigation bar. Sticky (see `header` in globals.css) so
 * it stays visible while scrolling. Step 4 adds login / logout and
 * role-specific links (e.g. "Jobs" for teachers).
 *
 * When the hero search box scrolls away, a compact copy of it fades in here
 * so search is always one tap away.
 */

import {SITE, SITE_NAME} from '@/config/site';
import {SearchBox} from './SearchBox';

interface SiteHeaderProps {
  /** True when the "Saved" tab is active; controls which link is highlighted. */
  savedOnly: boolean;
  savedCount: number;
  onExplore: () => void;
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
  onExplore,
  onShowSaved,
  onShowRequests,
  onListTraining,
  showSearch,
  query,
  onQueryChange,
  onSearch,
}: SiteHeaderProps) {
  return (
    <header className={showSearch ? 'with-search' : ''}>
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
      <nav>
        <button className={savedOnly ? '' : 'nav-active'} onClick={onExplore}>
          Explore training
        </button>
        <button className={savedOnly ? 'nav-active' : ''} onClick={onShowSaved}>
          Saved <span className="saved-count">{savedCount}</span>
        </button>
        <button onClick={onShowRequests}>My requests</button>
        <button className="btn small" onClick={onListTraining}>
          + List your training
        </button>
      </nav>
    </header>
  );
}
