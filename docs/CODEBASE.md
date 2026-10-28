# Codebase Map

This file describes what every file and folder is and why it exists.
**Update it in the same PR** whenever files are added, moved or removed.

_Last updated: Step 1 (Next.js skeleton + POC UI port)._

---

## How the pieces fit (big picture)

```
Browser request "/"
  -> src/app/layout.tsx       wraps every page (<html>, fonts, CSS)
  -> src/app/page.tsx         server: gets the course list (sample data for now)
  -> components/HomePage.tsx  browser: holds state, renders all sections
       -> SiteHeader, Hero, FilterSidebar, CatalogGrid > CourseCard, ...
       -> Modal > CourseDetail | BookingForm | ListingForm | RequestList
  -> lib/*                    data types, filtering, browser storage
```

- **Server vs. browser:** files in `app/` run on the server by default. That is where database reads will happen from Step 2. Files marked `'use client'` also run in the browser, because they react to clicks and typing.
- **Temporary parts:** sample data and browser storage reproduce the POC behaviour. The database replaces them step by step: courses in Step 2, listings in Step 4, saved courses in Step 5, and requests in Step 6.

---

## Root folder

| Path | What / why |
|---|---|
| `SkipPD_v2.md` | Project blueprint: features, decisions, technical plan, roadmap, open questions. |
| `README.md` | Short intro, how to run the project, branch workflow. |
| `AGENTS.md` | Instructions for AI coding assistants. Generated and kept up to date by Next.js; don't edit it by hand. |
| `docs/` | Developer documentation (this file and `CONVENTIONS.md`). |
| `src/` | All application source code. |
| `.github/CODEOWNERS` | Makes `@skippdtraining` the required reviewer for every PR. |
| `package.json` | Project name, npm scripts (`dev`, `build`, `lint`, `format`) and dependencies. |
| `package-lock.json` | Exact installed dependency versions, so every machine and Vercel install the same ones. Generated; don't edit. |
| `tsconfig.json` | TypeScript settings. Strict mode is on, and `@/` is an alias for `src/`. |
| `next.config.ts` | Next.js settings. Empty for now. |
| `eslint.config.mjs` | Linter rules (Next.js recommended set). The linter catches likely bugs. |
| `.prettierrc.json` / `.prettierignore` | Formatter settings and the files it skips. See `docs/CONVENTIONS.md`. |
| `.gitignore` | Files git must never commit: `node_modules`, build output, `.env*` secrets, the old `SkipPD.md`. |
| `WhatsApp Image ... .jpeg` | Jobs-page layout reference used in `SkipPD_v2.md`. |

Not committed: `node_modules/` (installed packages), `.next/` (build output), `next-env.d.ts` (generated types).

---

## `src/app/`: routes (pages)

In Next.js's App Router, each folder under `app/` is a URL path, and its `page.tsx` file is the page for that path.

| File | What / why |
|---|---|
| `layout.tsx` | Root layout shared by all pages. Loads the DM Sans and Manrope fonts via `next/font`, imports global CSS, and sets the browser tab title and description. |
| `page.tsx` | The `/` route. A server component that passes the course list to `HomePage`. Step 2 replaces the sample data with a Supabase query here. |
| `globals.css` | All styles, ported from the POC and grouped by page area. Colours are CSS variables in `:root`. The header is sticky and 64px tall. |
| `favicon.ico` | Browser tab icon. It is still the Next.js default; replace it with the SkipPD logo later. |

## `src/components/`: UI building blocks

| File | What / why |
|---|---|
| `HomePage.tsx` | **The conductor.** Owns page state (filters, which dialog is open, toast message), combines sample and browser listings, and wires all the sections together. Start reading here. |
| `SiteHeader.tsx` | Sticky top bar: logo, Explore / Saved / My requests, and "List your training". Step 3 adds login and role-based links. |
| `Hero.tsx` | `Hero`: headline, search box, popular searches, artwork. `TrustBar`: the strip of selling points under it. |
| `FilterSidebar.tsx` | `CategoryChips` (topic buttons) and `FilterSidebar` (format, grade, duration, price). They only report changes; the filtering itself is in `lib/filter-courses.ts`. |
| `CatalogGrid.tsx` | Result count, sort menu, the grid of `CourseCard`s, and the "no results" message. |
| `CourseCard.tsx` | One course tile: cover, title, trainer, hours, grades, tags, price, heart button. |
| `CourseIllustration.tsx` | Built-in SVG cover art for courses without an image, with one drawing per topic type. Copied from the POC. |
| `Modal.tsx` | Reusable pop-up built on the native `<dialog>` element. Closes on Esc, the × button, or a click outside. |
| `CourseDetail.tsx` | Dialog content: the full course description and the "Request a session" button. |
| `BookingForm.tsx` | Dialog content: the booking request form. Saves to the browser for now; Step 6 saves to the DB. |
| `ListingForm.tsx` | Dialog content: the new-listing form, with image validation (max 1 MB). Saves to the browser for now; Step 4 saves to the DB. |
| `RequestList.tsx` | Dialog content: "My booking requests", each with a Remove button. |
| `SiteFooter.tsx` | `TrainerBanner` ("Become a PD trainer") and the page `SiteFooter`. |

## `src/lib/`: logic and data (no layout)

| File | What / why |
|---|---|
| `types.ts` | **Single source of truth for data shapes:** `Course`, `BookingRequest`, `CatalogFilters`, the category, grade and format lists, and the default filters. In Step 2 these match the database tables. |
| `sample-courses.ts` | **Temporary.** The six POC courses. Becomes database seed data in Step 2, and then this file is deleted. |
| `filter-courses.ts` | Pure search, filter and sort function, plus `initials()`. Moves to DB queries in Step 2 without changing the filter shape. |
| `local-store.ts` | Generic helper that keeps a list in `localStorage` and re-renders React when it changes, using `useSyncExternalStore`. |
| `browser-storage.ts` | **Temporary.** The three browser lists: saved ids, own listings, and requests. Components only call these functions, so switching to the DB later touches one place. |
| `form-helpers.ts` | Reads text and numbers out of submitted forms, splits lists, and reads image files. |
| `use-toast.ts` | Hook for the short bottom-of-screen message that disappears after 4 s. |

---

## Changelog of this map
- **Step 1:** initial structure; `HomeClient` split into section components; docs added.
