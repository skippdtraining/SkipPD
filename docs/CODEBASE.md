# Codebase Map

This file describes what every file and folder is and why it exists.
**Update it in the same PR** whenever files are added, moved or removed.

_Last updated: Step 3 (Supabase-backed catalog)._

All app code lives in `web/`. Paths below starting with `src/` mean `web/src/`.

---

## How the pieces fit (big picture)

```
Browser request "/"
  -> src/app/layout.tsx       wraps every page (<html>, fonts, CSS)
  -> src/app/page.tsx         server: asks the course repository for courses + topics
  -> components/HomePage.tsx  browser: holds state, renders all sections;
                              on filter change calls GET /api/courses
  -> src/app/api/courses      server: decodes the query, asks the repository
       -> SiteHeader, Hero, FilterSidebar, CatalogGrid > CourseCard, ...
       -> Modal > CourseDetail | BookingForm | ListingForm | RequestList
  -> lib/data/*               repositories: the ONLY code that knows the database (Supabase)
  -> config/*                 branding + business settings
  -> lib/*                    types, filtering, formatting, browser storage
```

- **Server vs. browser:** files in `app/` run on the server by default. That is where database reads happen. Files marked `'use client'` also run in the browser, because they react to clicks and typing.
- **Temporary parts:** browser storage reproduces the POC behaviour. The database replaces it step by step: courses in Step 3 (done), listings in Step 5, saved courses in Step 6, and requests in Step 7.

---

## Repository layout

| Path | What / why |
|---|---|
| `README.md` | Short intro, how to run, branch workflow. |
| `AGENTS.md` | Start-here guide for AI agents and new contributors: which docs to read, working rules. |
| `.github/CODEOWNERS` | Makes `@skippdtraining` the required reviewer for every PR. |
| `.gitignore` | Files git must never commit (`node_modules`, build output, `.env*` secrets, the old `SkipPD.md`). |
| `docs/` | **All documentation**, kept separate from code. |
| `docs/SkipPD_v2.md` | Project blueprint: features, decisions, plan, roadmap, open questions. |
| `docs/CODEBASE.md` | This file. |
| `docs/HOW-TO.md` | Task-based lookup: which file to edit for common changes, plus recipes. |
| `docs/CONVENTIONS.md` | Code style, documentation and modularity rules. |
| `docs/assets/` | Images used by the docs (e.g. `jobs-page-reference.jpeg`). |
| `supabase/migrations/` | SQL that creates the database tables, run in order in the Supabase SQL Editor. `0001_catalog.sql`: `categories`, `listings`, Row Level Security (public read of published listings). |
| `supabase/seed.sql` | Starter data: six suggested topics and the six POC courses. Re-runnable (empties the tables first). |
| `web/` | **The Next.js application.** Run all npm commands inside this folder. |

## `web/`: application root

| Path | What / why |
|---|---|
| `src/` | All application source code. |
| `package.json` | npm scripts (`dev`, `build`, `lint`, `format`) and dependencies. |
| `package-lock.json` | Exact dependency versions so every machine and Vercel install the same. Generated. |
| `tsconfig.json` | TypeScript settings; strict mode; `@/` = `web/src/`. |
| `next.config.ts` | Next.js settings: Cache Components and Partial Prefetching on. |
| `.env.example` | Template for `.env.local`: the environment variables the app needs (`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`). `.env.local` itself is git-ignored. |
| `eslint.config.mjs` | Linter rules (Next.js recommended), catches likely bugs. |
| `.prettierrc.json` / `.prettierignore` | Formatter settings. |
| `AGENTS.md` | Notes for AI coding assistants, maintained by Next.js. Don't edit. |

Not committed: `web/node_modules/`, `web/.next/`, `web/next-env.d.ts` (all generated).

---

## `src/app/`: routes (pages)

In Next.js's App Router, each folder under `app/` is a URL path, and its `page.tsx` file is the page for that path.

| File | What / why |
|---|---|
| `layout.tsx` | Root layout shared by all pages. Loads the DM Sans and Manrope fonts via `next/font`, imports global CSS, and sets the browser tab title and description. |
| `page.tsx` | The `/` route. Server component: on every request gets the default catalog results and the topic list via `getCourseRepository()` and passes them to `HomePage`. Never imports a database client directly. |
| `api/courses/route.ts` | `GET /api/courses?q=&format=&grade=&duration=&maxPrice=&sort=&ids=`: catalog search for the browser. Returns `{courses}`. |
| `globals.css` | All styles, ported from the POC and grouped by page area. Colours are CSS variables in `:root`. The header is sticky and 64px tall. The "Responsive" section at the end adapts the layout for tablets and phones. |
| `[slug]/page.tsx` | **Temporary.** "Coming soon" page for each footer link (`/about`, `/terms`...), generated from `FOOTER_COLUMNS`. Real pages get their own folder later. |
| `favicon.ico` | Browser tab icon. It is still the Next.js default; replace it with the SkipPD logo later. |

## `src/components/`: UI building blocks

| File | What / why |
|---|---|
| `HomePage.tsx` | **The conductor.** Owns page state (filters, which dialog is open, toast message), fetches server results when filters change, merges in browser listings, and wires all the sections together. Start reading here. |
| `SiteHeader.tsx` | Sticky top bar: logo, compact search (fades in once the hero search scrolls away), Explore / Saved / My requests, and "List your training" (behind a ☰ menu on phones). Step 4 adds login and role-based links. |
| `SearchBox.tsx` | Search form used twice: large in the hero, compact in the header. Both share one query. |
| `Hero.tsx` | Headline, search box and artwork. |
| `FilterSidebar.tsx` | Format, grade, duration and price filters; collapsed behind a "Filters" button on phones. Only reports changes; filtering runs on the server. |
| `CatalogGrid.tsx` | Result count, sort menu, one page of `CourseCard`s (max `COURSES_PER_PAGE`), page arrows/numbers, and the "no results" message. |
| `CourseCard.tsx` | One course tile: cover, title, trainer, hours, grades, tags, price, heart button. |
| `CourseIllustration.tsx` | Built-in SVG cover art for courses without an image, with one drawing per topic type. Copied from the POC. |
| `Modal.tsx` | Reusable pop-up built on the native `<dialog>` element. Closes on Esc, the × button, or a click outside. |
| `CourseDetail.tsx` | Dialog content: the full course description and the "Request a session" button. |
| `BookingForm.tsx` | Dialog content: the booking request form. Saves to the browser for now; Step 7 saves to the DB. |
| `ListingForm.tsx` | Dialog content: the new-listing form, with image validation (max 1 MB) an "Other" topic option that reveals a free-text field. No trainer name, credentials or keywords: those come from the account (Step 4). Saves to the browser for now; Step 5 saves to the DB. |
| `OutcomeListField.tsx` | Listing-form field: one input per learning outcome, "+ Add outcome" and × remove buttons. |
| `RequestList.tsx` | Dialog content: "My booking requests", each with a Remove button. |
| `SocialIcon.tsx` | Inline SVG logos (LinkedIn, Instagram, Facebook, X) for the footer. |
| `SiteFooter.tsx` | `TrainerBanner` ("Become a PD trainer") and `SiteFooter`: brand, social icons, link columns from `config/site.ts`, copyright. |

## `src/config/`: settings, no logic

| File | What / why |
|---|---|
| `site.ts` | Brand name, stage label, tab title, SEO text, footer tagline, copyright year and footer links. A rename is one edit here. |
| `catalog.ts` | Business settings: price filter brackets, "short course" hours, search debounce, custom-topic and image upload limits. |

## `src/lib/data/`: data access (the database boundary)

| File | What / why |
|---|---|
| `course-repository.ts` | The `CourseRepository` **interface** (what the app can ask about courses) and `getCourseRepository()`, the one line that picks the backend. |
| `supabase-course-repository.ts` | Supabase implementation. The only file with table/column names and the Supabase client. Turns a `CourseQuery` into a database query (search, filters, sort) and rows into `Course`. Reads `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY`. Server only. |

## `src/lib/`: logic and helpers (no layout)

| File | What / why |
|---|---|
| `types.ts` | **Single source of truth for data shapes:** `Course`, `BookingRequest`, `CatalogFilters`, `CourseQuery` (filters sent to the server), grade and format lists, and the default filters. Database rows are converted into these in `lib/data/`. |
| `filter-courses.ts` | **Temporary.** Same search/filter/sort rules as the database query, applied in the browser to listings stored in this browser. Removed when listings move to the DB (Step 5). |
| `course-query-params.ts` | Encodes a `CourseQuery` into URL params (browser) and decodes + validates them (`/api/courses`). |
| `catalog-api.ts` | Browser helper: `fetchCourses()` calls `/api/courses`; `toCourseQuery()` turns filters + saved ids into a server query. |
| `local-store.ts` | Generic helper that keeps a list in `localStorage` and re-renders React when it changes, using `useSyncExternalStore`. |
| `browser-storage.ts` | **Temporary.** The three browser lists: saved ids, own listings, and requests. Components only call these functions, so switching to the DB later touches one place. |
| `format.ts` | Display helpers: `initials`, `gradeLabel`, `formatPrice`. |
| `form-helpers.ts` | Reads text and numbers out of submitted forms, splits lists, and reads image files. |
| `use-is-offscreen.ts` | Hook: tells whether an element scrolled out of view (IntersectionObserver). Drives the header search. |
| `scroll.ts` | `scrollBelowHeader()`: smooth scroll that measures the sticky header live, so no hard-coded heights. |
| `use-toast.ts` | Hook for the short bottom-of-screen message that disappears after 4 s. |

---

## Changelog of this map
- **Step 3:** added `supabase/` (migration + seed), `supabase-course-repository.ts`, `app/api/courses/route.ts`, `course-query-params.ts`, `catalog-api.ts`, `.env.example`; removed the sample data files; suggested topics now come from the `categories` table.
- **Step 1:** initial structure; `HomeClient` split into section components; docs added.
- **Step 2:** removed Explore button (Saved toggles); catalog pagination;
  removed popular searches, trust bar and topic chips (topic is now free text with "Other"); new footer with link columns and `[slug]` placeholder pages; responsive layout; header search.
- **Roadmap change:** new Step 2 (UI changes) inserted; all later step numbers in docs and code comments shifted by one.
- **Step 1 (modularity):** code moved to `web/`, docs to `docs/`; added `config/`, `lib/data/` repository layer, `lib/format.ts`.
