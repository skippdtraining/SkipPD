/**
 * @fileoverview Bottom of the home page: the "Become a PD trainer" banner
 * and the site footer.
 */

import {SITE} from '@/config/site';

interface TrainerBannerProps {
  onListTraining: () => void;
}

/** Call-to-action banner inviting teachers to list a training. */
export function TrainerBanner({onListTraining}: TrainerBannerProps) {
  return (
    <section className="bottom-banner">
      <div>
        <div className="eyebrow banner-eyebrow">Your experience has value</div>
        <h2>Good at what you do? Share it.</h2>
        <p>Turn your classroom expertise into meaningful learning for other educators.</p>
      </div>
      <button className="btn" onClick={onListTraining}>
        Become a PD trainer ↗
      </button>
    </section>
  );
}

/** Page footer. */
export function SiteFooter() {
  return (
    <footer>
      <span className="brand footer-brand">
        {SITE.nameStart}
        <b>{SITE.nameEnd}</b>
      </span>
      <span>{SITE.footerTagline}</span>
      <span>Preview · Sample listings</span>
    </footer>
  );
}
