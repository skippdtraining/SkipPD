/**
 * @fileoverview Top navigation bar. Sticky (see `header` in globals.css) so
 * it stays visible while scrolling. Step 4 adds login / logout and
 * role-specific links (e.g. "Jobs" for teachers).
 */

import {SITE, SITE_NAME} from '@/config/site';

interface SiteHeaderProps {
  /** True when the "Saved" tab is active; controls which link is highlighted. */
  savedOnly: boolean;
  savedCount: number;
  onExplore: () => void;
  onShowSaved: () => void;
  onShowRequests: () => void;
  onListTraining: () => void;
}

/** Brand logo plus the main navigation buttons. */
export function SiteHeader({
  savedOnly,
  savedCount,
  onExplore,
  onShowSaved,
  onShowRequests,
  onListTraining,
}: SiteHeaderProps) {
  return (
    <header>
      <a className="brand" href="./" aria-label={`${SITE_NAME} home`}>
        <span className="logo">✧</span>
        {SITE.nameStart}
        <b>{SITE.nameEnd}</b>
        <span className="demo">{SITE.stageLabel}</span>
      </a>
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
