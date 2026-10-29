# How-To: Common Changes

Task-based lookup: "I want to change X, which file do I edit?"
For a file-by-file description, see [CODEBASE.md](CODEBASE.md). For rules, see [CONVENTIONS.md](CONVENTIONS.md).

All paths are relative to the repository root. Run npm commands inside `web/`.

**Keep this file updated:** any PR that adds a setting or changes where something lives must update this table.

---

## Quick lookup

| I want to change… | File | Notes |
|---|---|---|
| Brand name, "Preview" label, tab title, SEO description, footer tagline | `web/src/config/site.ts` | Used by header, footer and page metadata. |
| Price filter brackets ("Under $75"...) | `web/src/config/catalog.ts` → `PRICE_FILTER_OPTIONS` | Values in USD. |
| What counts as a "short" course | `web/src/config/catalog.ts` → `SHORT_COURSE_MAX_HOURS` | Filter labels update automatically. |
| "Popular" searches under the search box | `web/src/config/catalog.ts` → `POPULAR_SEARCHES` | `label` is shown, `query` is searched. |
| Max keywords per listing | `web/src/config/catalog.ts` → `MAX_LISTING_TAGS` | |
| Image upload size / allowed types | `web/src/config/catalog.ts` → `MAX_IMAGE_BYTES`, `IMAGE_TYPES` | |
| Topics (categories) | `web/src/lib/types.ts` → `CATEGORIES` | Chips and listing form update automatically. |
| Grade bands | `web/src/lib/types.ts` → `Grade`, `GRADES` | Update both. |
| Delivery formats | `web/src/lib/types.ts` → `Format`, `FORMATS` | Update both. |
| Default filter state | `web/src/lib/types.ts` → `DEFAULT_FILTERS` | |
| Colours (palette) | `web/src/app/globals.css` → `:root` variables | e.g. `--purple`. |
| Fonts | `web/src/app/layout.tsx` (loading) + `globals.css` `--body-font` / `--head-font` | |
| Header height / sticky behaviour | `web/src/app/globals.css` → `header { ... }` | Mobile override in the `@media (max-width: 730px)` block. |
| Phone / tablet layout | `web/src/app/globals.css` → "Responsive" section at the end | Breakpoints: 1050px tablet, 730px phone, 480px small phone. |
| Mobile filter toggle | `web/src/components/FilterSidebar.tsx` | Collapsed on phones only. |
| Header search (look, animation) | `web/src/app/globals.css` → `.header-search`, `.search-compact` | When it appears: `HomePage.tsx` (`useIsOffscreen`). |
| Search box text / placeholder | `web/src/components/SearchBox.tsx` | |
| Hero headline and text | `web/src/components/Hero.tsx` | Trust-bar points: `TRUST_POINTS` in the same file. |
| Price / grade display format | `web/src/lib/format.ts` | |
| Search / filter / sort logic | `web/src/lib/filter-courses.ts` | |
| Where course data comes from (database) | `web/src/lib/data/course-repository.ts` → `getCourseRepository()` | See recipe below. |
| Sample courses (temporary) | `web/src/lib/data/sample-courses.ts` | Removed in Step 3. |
| Required PR reviewer | `.github/CODEOWNERS` | |
| Files git ignores | `.gitignore` | |

---

## Recipes

### Add a new topic
1. Add the name to `CATEGORIES` in `web/src/lib/types.ts`.
2. That's it for the UI. From Step 3, also add it to the database (see the migration notes in `CODEBASE.md` once they exist).

### Add a new setting
1. Add a documented constant to the right file in `web/src/config/` (`site.ts` for branding, `catalog.ts` for catalog business rules, or a new file for a new area).
2. Import it where needed. Never hard-code the value in a component.
3. Add a row to the quick-lookup table above.

### Add a new page
1. Create `web/src/app/<route>/page.tsx` with a default export (Next.js requirement).
2. Fetch data through a repository in `web/src/lib/data/`, never a database client directly.
3. Add the file to `docs/CODEBASE.md`.

### Switch the database backend (e.g. Supabase → AWS)
1. Create `web/src/lib/data/<vendor>-course-repository.ts` that implements `CourseRepository` and returns the app types from `lib/types.ts`.
2. Change the one line in `getCourseRepository()` in `course-repository.ts`.
3. Put credentials in environment variables (`web/.env.local` locally, Vercel project settings in production).
4. No component or page should need changes. If one does, the boundary was broken; fix that first.

### Test on phones and tablets
1. Run `npm run dev`, open http://localhost:3000 in Chrome or Edge.
2. Press F12, then Ctrl+Shift+M (device toolbar). Pick e.g. iPhone SE, iPhone 14, iPad.
3. Check: no sideways page scroll, everything tappable, forms do not zoom in.
4. Real devices: open the PR's Vercel preview URL on your phone.

### Run checks before a PR
```bash
cd web
npm run format
npm run lint
npm run build
```
