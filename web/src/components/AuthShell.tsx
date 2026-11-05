/**
 * @fileoverview Page frame for the account pages (sign-in, sign-up,
 * onboarding, account): the site header, a centred card and the footer.
 */

import {PageHeader} from './PageHeader';
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
      <PageHeader />
      <main className="auth-page">
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
