# Codebase Map

This file describes what every file and folder is and why it exists.
**Update it in the same PR** whenever files are added, moved or removed.

_Last updated: Step 4 (accounts)._

All app code lives in `web/`. Paths below starting with `src/` mean `web/src/`.

---

## How the pieces fit (big picture)

```
Browser request "/"
  -> src/app/layout.tsx       wraps every page (<html>, fonts, CSS)
  -> src/proxy.ts             runs first on every page: refreshes the sign-in cookie
  -> src/app/page.tsx         server: asks the course repository for courses + topics,
                              and lib/viewer for the signed-in visitor
  -> components/HomePage.tsx  browser: holds state, renders all sections;
                              on filter change calls GET /api/courses
  -> src/app/api/courses      server: decodes the query, asks the repository
       -> SiteHeader, Hero, FilterSidebar, CatalogGrid > CourseCard, ...
       -> Modal > CourseDetail | BookingForm | ListingForm | RequestList
  -> lib/data/*               repositories: the ONLY code that knows the database (Supabase)
  -> lib/auth/*               sign-in service: the ONLY code that knows the auth vendor
  -> lib/supabase/clients.ts  creates Supabase clients; used only by the two folders above

Account pages: /sign-in, /sign-up, /forgot-password, /reset-password,
/onboarding, /account -> server actions in app/actions/ -> lib/auth + lib/data.
Email links and Google return to /auth/callback.
  -> config/*                 branding + business settings
  -> lib/*                    types, filtering, formatting, browser storage
```

- **Server vs. browser:** files in `app/` run on the server by default. That is where database reads happen. Files marked `'use client'` also run in the browser, because they react to clicks and typing.
- **Temporary parts:** browser storage reproduces the POC behaviour. The database replaces it step by step: courses in Step 3 (done), listings in Step 6, saved courses in Step 7, and requests in Step 8.

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
| `supabase/migrations/0002_accounts.sql` | `profiles` (trainer/school details, review statuses), `school_email_domains`, `is_likely_school_email()`, the private `certifications` storage bucket, and the rules that stop users changing review statuses. |
| `supabase/migrations/0003_split_profiles.sql` | Moves trainer-only fields to `trainer_profiles` and school-only fields to `school_profiles`; `profiles` keeps role, name, email. Copies existing data. |
| `supabase/migrations/0004_lock_approved_profiles.sql` | Locks the trainer's name and the school's name once approved (site users only; the dashboard can still edit). |
| `supabase/migrations/0005_trainer_license.sql` | Optional teaching license (state + number) on `trainer_profiles` with its own `license_status`; resets to pending on change, locked once approved. |
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
| `page.tsx` | The `/` route. Server component: on every request gets the default catalog results, the topic list and the visitor (`getViewer()`) and passes them to `HomePage`. Never imports a database client directly. |
| `sign-in/page.tsx` | Email + password sign-in and "Continue with Google". `?next=` returns to a page afterwards. |
| `sign-up/page.tsx` | Create an account (email confirmation) or Google. |
| `forgot-password/page.tsx` / `reset-password/page.tsx` | Request a reset email / set a new password (also used for "Change password"). |
| `onboarding/page.tsx` | First-time profile form: account type plus trainer or school details. |
| `account/page.tsx` | Review status, profile summary with Edit button, back to trainings, change password, sign out. |
| `auth/callback/route.ts` | Where email links (`token_hash`) and Google sign-in (`code`) return: creates the session, then opens `next` or `/onboarding`. An already-used confirmation link asks the user to sign in. |
| `actions/auth.ts` | Server actions: sign in, sign up, Google, forgot/reset password, sign out. |
| `actions/profile.ts` | Server action: validate and save the profile form, upload the certification. New profiles go to the home page (welcome message); edits return to the account summary. |
| `api/courses/route.ts` | `GET /api/courses?q=&format=&grade=&duration=&maxPrice=&sort=&ids=`: catalog search for the browser. Returns `{courses}`. |
| `globals.css` | All styles, ported from the POC and grouped by page area. Colours are CSS variables in `:root`. The header is sticky and 64px tall. The "Responsive" section at the end adapts the layout for tablets and phones. |
| `[slug]/page.tsx` | **Temporary.** "Coming soon" page for each footer link (`/about`, `/terms`...), generated from `FOOTER_COLUMNS`. Real pages get their own folder later. |
| `../proxy.ts` (`src/proxy.ts`) | Next.js proxy (formerly middleware): refreshes the sign-in session cookie before each page. Does not block pages; each page checks the user itself. |
| `favicon.ico` | Browser tab icon. It is still the Next.js default; replace it with the SkipPD logo later. |

## `src/components/`: UI building blocks

| File | What / why |
|---|---|
| `HomePage.tsx` | **The conductor.** Owns page state (filters, which dialog is open, toast message), fetches server results when filters change, merges in browser listings, and wires all the sections together. Start reading here. |
| `SiteHeader.tsx` | Sticky top bar: logo, compact search (fades in once the hero search scrolls away), Saved / My requests, Sign in or Account, and "List your training" (behind a ☰ menu on phones). |
| `AuthShell.tsx` | Page frame for the account pages: logo, centred card, footer (hidden on phones, where text is larger). |
| `AuthForm.tsx` | Generic form for sign-in/up and password pages: runs a server action, shows its error or success note. |
| `GoogleSignInButton.tsx` | "Continue with Google" button (a form posting to a server action). |
| `ProfileForm.tsx` | Trainer / school profile form used by onboarding and the account page. |
| `AccountProfile.tsx` | Account page: read-only profile summary; "Edit profile" swaps in `ProfileForm`, saving returns to the summary. |
| `AccountStatus.tsx` | Account page status: certificate ("Certified") and teaching license ("Licensed") for trainers, verification for schools. |
| `SearchBox.tsx` | Search form used twice: large in the hero, compact in the header. Both share one query. |
| `Hero.tsx` | Headline, search box and artwork. |
| `FilterSidebar.tsx` | Format, grade, duration and price filters; collapsed behind a "Filters" button on phones. Only reports changes; filtering runs on the server. |
| `CatalogGrid.tsx` | Result count, sort menu, one page of `CourseCard`s (max `COURSES_PER_PAGE`), page arrows/numbers, and the "no results" message. |
| `CourseCard.tsx` | One course tile: cover, title, trainer, hours, grades, tags, price, heart button. |
| `CourseIllustration.tsx` | Built-in SVG cover art for courses without an image, with one drawing per topic type. Copied from the POC. |
| `Modal.tsx` | Reusable pop-up built on the native `<dialog>` element. Closes on Esc, the × button, or a click outside. |
| `CourseDetail.tsx` | Dialog content: the full course description and the "Request a session" button. |
| `BookingForm.tsx` | Dialog content: the booking request form. Saves to the browser for now; Step 8 saves to the DB. |
| `ListingForm.tsx` | Dialog content: the new-listing form, with image validation (max 1 MB) an "Other" topic option that reveals a free-text field. No trainer name, credentials or keywords: those come from the account (Step 4). Saves to the browser for now; Step 6 saves to the DB. |
| `OutcomeListField.tsx` | Listing-form field: one input per learning outcome, "+ Add outcome" and × remove buttons. |
| `RequestList.tsx` | Dialog content: "My booking requests", each with a Remove button. |
| `SocialIcon.tsx` | Inline SVG logos (LinkedIn, Instagram, Facebook, X) for the footer. |
| `SiteFooter.tsx` | `TrainerBanner` ("Become a PD trainer") and `SiteFooter`: brand, social icons, link columns from `config/site.ts`, copyright. |

## `src/config/`: settings, no logic

| File | What / why |
|---|---|
| `site.ts` | Brand name, stage label, tab title, SEO text, footer tagline, copyright year and footer links. A rename is one edit here. |
| `accounts.ts` | Password length, profile field limits, certification file size/types, page after sign-in. Keep in sync with `0002_accounts.sql`. |
| `catalog.ts` | Business settings: price filter brackets, "short course" hours, search debounce, custom-topic and image upload limits. |

## `src/lib/data/`: data access (the database boundary)

| File | What / why |
|---|---|
| `course-repository.ts` | The `CourseRepository` **interface** (what the app can ask about courses) and `getCourseRepository()`, the one line that picks the backend. |
| `profile-repository.ts` | The `ProfileRepository` interface (current user's profile, certification upload) and `getProfileRepository()`. |
| `supabase-profile-repository.ts` | Supabase implementation: joins `profiles` with `trainer_profiles` or `school_profiles` into one `Profile`; `certifications` bucket. Never writes review statuses. |
| `supabase-course-repository.ts` | Supabase implementation. The only file with table/column names and the Supabase client. Turns a `CourseQuery` into a database query (search, filters, sort) and rows into `Course`. Reads `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY`. Server only. |

## `src/lib/auth/`: sign-in (the auth boundary)

| File | What / why |
|---|---|
| `auth-service.ts` | The `AuthService` interface (current user, sign in/up, Google, password reset, sign out), `getAuthService()`, and `refreshSession()` for the proxy. |
| `supabase-auth-service.ts` | Supabase Auth implementation. The only file calling `supabase.auth` for sign-in. |

## `src/lib/supabase/`: shared vendor client

| File | What / why |
|---|---|
| `clients.ts` | The only place reading `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY`. Public client (catalog), request client (acts as the signed-in user via cookies), and the cookie refresh used by the proxy. |

## `src/lib/`: logic and helpers (no layout)

| File | What / why |
|---|---|
| `types.ts` | **Single source of truth for data shapes:** `Course`, `BookingRequest`, `CatalogFilters`, `CourseQuery` (filters sent to the server), `AccountRole`, `Profile`, `ProfileInput`, `Viewer`, grade and format lists, and the default filters. Database rows are converted into these in `lib/data/`. |
| `filter-courses.ts` | **Temporary.** Same search/filter/sort rules as the database query, applied in the browser to listings stored in this browser. Removed when listings move to the DB (Step 6). |
| `profile-locks.ts` | Which fields are locked after approval (`isFieldLocked`, `keepLockedFields`). Mirrors migration 0004. |
| `viewer.ts` | `getViewer()`: the signed-in visitor with their profile (or null); `safeNextPath()` blocks redirects to other sites. |
| `profile-form.ts` | Reads and validates the profile form on the server (required fields per account type, lengths, certification file type/size). |
| `request-origin.ts` | Site address of the current request, so email and Google links return to the same site (production, preview or localhost). |
| `course-query-params.ts` | Encodes a `CourseQuery` into URL params (browser) and decodes + validates them (`/api/courses`). |
| `catalog-api.ts` | Browser helper: `fetchCourses()` calls `/api/courses`; `toCourseQuery()` turns filters + saved ids into a server query. |
| `local-store.ts` | Generic helper that keeps a list in `localStorage` and re-renders React when it changes, using `useSyncExternalStore`. |
| `browser-storage.ts` | **Temporary.** The three browser lists: saved ids, own listings, and requests. Components only call these functions, so switching to the DB later touches one place. |
| `format.ts` | Display helpers: `initials`, `gradeLabel`, `formatPrice`. |
| `form-helpers.ts` | Reads text and numbers out of submitted forms, and reads image files. |
| `use-is-offscreen.ts` | Hook: tells whether an element scrolled out of view (IntersectionObserver). Drives the header search. |
| `scroll.ts` | `scrollBelowHeader()`: smooth scroll that measures the sticky header live, so no hard-coded heights. |
| `use-toast.ts` | Hook for the short bottom-of-screen message that disappears after 4 s. |

---

## Changelog of this map
- **Step 4 follow-up:** trainer teaching license (migration 0005); `profile-locks.ts` + migration 0004 (locked fields after approval); profiles split into `trainer_profiles` / `school_profiles` (migration 0003); guests see only Sign in and List your training (no hearts); account pages on phones drop the footer and use larger text.
- **Step 4:** accounts. Added `supabase/migrations/0002_accounts.sql`, `src/proxy.ts`, `lib/auth/`, `lib/supabase/`, profile repository, `lib/viewer.ts`, `lib/profile-form.ts`, `lib/request-origin.ts`, `config/accounts.ts`, account pages and server actions, auth components. Course repository now uses the shared client. Roadmap: new Step 5 (admin role); later steps shifted by one.
- **Step 3:** added `supabase/` (migration + seed), `supabase-course-repository.ts`, `app/api/courses/route.ts`, `course-query-params.ts`, `catalog-api.ts`, `.env.example`; removed the sample data files; suggested topics now come from the `categories` table.
- **Step 1:** initial structure; `HomeClient` split into section components; docs added.
- **Step 2:** removed Explore button (Saved toggles); catalog pagination;
  removed popular searches, trust bar and topic chips (topic is now free text with "Other"); new footer with link columns and `[slug]` placeholder pages; responsive layout; header search.
- **Roadmap change:** new Step 2 (UI changes) inserted; all later step numbers in docs and code comments shifted by one.
- **Step 1 (modularity):** code moved to `web/`, docs to `docs/`; added `config/`, `lib/data/` repository layer, `lib/format.ts`.
