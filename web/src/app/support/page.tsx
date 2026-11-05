/**
 * @fileoverview Support Center home (/support): help articles grouped by
 * category. Linked from the site footer.
 *
 * Article text lives in config/support-articles.ts; this page only lays it
 * out. Next.js requires a default export here (see docs/CONVENTIONS.md).
 */

import type {Metadata} from 'next';
import Link from 'next/link';
import {PageHeader} from '@/components/PageHeader';
import {SiteFooter} from '@/components/SiteFooter';
import {SITE_NAME} from '@/config/site';
import {SUPPORT_CATEGORIES, SUPPORT_CONTACT_HREF} from '@/config/support-articles';

export const metadata: Metadata = {
  title: `Support Center | ${SITE_NAME}`,
  description: `Help articles for finding, booking and listing training on ${SITE_NAME}.`,
};

export default function SupportCenterPage() {
  return (
    <>
      <PageHeader />
      <main className="support-page">
        <div className="support-intro">
          <div className="eyebrow">Support Center</div>
          <h1>How can we help?</h1>
          <p>Guides and answers for teachers, schools and trainers.</p>
        </div>
        {SUPPORT_CATEGORIES.map((category) => (
          <section key={category.title} className="support-category">
            <h2>{category.title}</h2>
            <p>{category.description}</p>
            <ul className="support-article-grid">
              {category.articles.map((article) => (
                <li key={article.slug}>
                  <Link
                    className="support-article-card"
                    href={`/support/${article.slug}`}
                  >
                    <h3>{article.title}</h3>
                    <p>{article.summary}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
        <div className="support-contact">
          <h2>Still need help?</h2>
          <p>Our team is happy to answer your questions.</p>
          <Link className="btn" href={SUPPORT_CONTACT_HREF}>
            Contact us
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
