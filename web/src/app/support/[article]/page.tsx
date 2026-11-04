/**
 * @fileoverview One Support Center article (/support/<slug>).
 *
 * Pages are built ahead of time, one per article in
 * config/support-articles.ts. Next.js requires a default export here
 * (see docs/CONVENTIONS.md).
 */

import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {SiteFooter} from '@/components/SiteFooter';
import {SITE_NAME} from '@/config/site';
import {ALL_SUPPORT_ARTICLES} from '@/config/support-articles';

/** Most "Related articles" links shown under an article. */
const MAX_RELATED_ARTICLES = 3;

function findArticle(slug: string) {
  return ALL_SUPPORT_ARTICLES.find((article) => article.slug === slug);
}

/** Tells Next.js which pages to build ahead of time: one per article. */
export function generateStaticParams() {
  return ALL_SUPPORT_ARTICLES.map((article) => ({article: article.slug}));
}

export async function generateMetadata({
  params,
}: PageProps<'/support/[article]'>): Promise<Metadata> {
  const article = findArticle((await params).article);
  if (!article) return {title: SITE_NAME};
  return {title: `${article.title} | ${SITE_NAME} Support`, description: article.summary};
}

export default async function SupportArticlePage({
  params,
}: PageProps<'/support/[article]'>) {
  const article = findArticle((await params).article);
  if (!article) notFound();

  const related = ALL_SUPPORT_ARTICLES.filter(
    (other) =>
      other.categoryTitle === article.categoryTitle && other.slug !== article.slug,
  ).slice(0, MAX_RELATED_ARTICLES);

  return (
    <>
      <main className="support-page support-article">
        <nav className="support-breadcrumb" aria-label="Breadcrumb">
          <Link href="/support">Support Center</Link>
          <span aria-hidden="true">/</span>
          <span>{article.categoryTitle}</span>
        </nav>
        <article>
          <h1>{article.title}</h1>
          <p className="support-article-summary">{article.summary}</p>
          {article.sections.map((section, index) => {
            const List = section.ordered ? 'ol' : 'ul';
            return (
              // Sections have no id and never reorder, so the index is a stable key.
              <section key={index}>
                {section.heading && <h2>{section.heading}</h2>}
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.list && (
                  <List>
                    {section.list.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </List>
                )}
              </section>
            );
          })}
        </article>
        {related.length > 0 && (
          <aside className="support-related">
            <h2>Related articles</h2>
            <ul>
              {related.map((other) => (
                <li key={other.slug}>
                  <Link href={`/support/${other.slug}`}>{other.title}</Link>
                </li>
              ))}
            </ul>
          </aside>
        )}
        <div className="support-contact">
          <h2>Didn&apos;t find your answer?</h2>
          <div className="support-contact-actions">
            <Link className="btn light" href="/support">
              ← All articles
            </Link>
            <Link className="btn" href="/contact">
              Contact us
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
