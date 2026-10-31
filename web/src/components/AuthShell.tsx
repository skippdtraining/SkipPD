/**
 * @fileoverview Page frame for the account pages (sign-in, sign-up,
 * onboarding, account): brand link, a centred card and the footer.
 */

import Link from 'next/link';
import {SITE, SITE_NAME} from '@/config/site';
import {SiteFooter} from './SiteFooter';

interface AuthShellProps {
  title: string;
  /** Short line under the title. */
  intro?: string;
  children: React.ReactNode;
}

/** Centred card layout shared by all account pages. */
export function AuthShell({title, intro, children}: AuthShellProps) {
  return (
    <>
      <main className="auth-page">
        <Link className="brand" href="/" aria-label={`${SITE_NAME} home`}>
          <span className="logo">✧</span>
          <span className="brand-name">
            {SITE.nameStart}
            <b>{SITE.nameEnd}</b>
          </span>
        </Link>
        <section className="auth-card">
          <h1>{title}</h1>
          {intro && <p className="auth-intro">{intro}</p>}
          {children}
        </section>
      </main>
      {/* Hidden on phones (globals.css) so the form gets the whole screen. */}
      <div className="auth-footer">
        <SiteFooter />
      </div>
    </>
  );
}
