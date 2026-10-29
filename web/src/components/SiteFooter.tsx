/**
 * @fileoverview Bottom of the home page: the "Become a PD trainer" banner
 * and the site footer.
 */

import Link from 'next/link';
import {FOOTER_COLUMNS, SITE, SITE_NAME} from '@/config/site';

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

/** Page footer: brand, link columns and copyright. Links come from config/site.ts. */
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-about">
          <span className="brand footer-brand">
            {SITE.nameStart}
            <b>{SITE.nameEnd}</b>
          </span>
          <p>{SITE.footerTagline}</p>
        </div>
        <nav className="footer-links" aria-label="Footer">
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <h4>{column.title}</h4>
              <ul>
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className="footer-bottom">
        © {SITE.copyrightYear} {SITE_NAME}. All rights reserved.
      </div>
    </footer>
  );
}
