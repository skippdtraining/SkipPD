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
| Cards per catalog page | `web/src/config/catalog.ts` → `COURSES_PER_PAGE` | Arrows + page numbers appear when there are more. |
| Scroll behaviour when changing catalog page | `web/src/config/catalog.ts` → `PAGE_CHANGE_SCROLL` | `'catalog-top'` or `'none'`. Header height is measured live (`lib/scroll.ts`). |
| Max keywords per listing | `web/src/config/catalog.ts` → `MAX_LISTING_TAGS` | |
| Image upload size / allowed types | `web/src/config/catalog.ts` → `MAX_IMAGE_BYTES`, `IMAGE_TYPES` | |
| Suggested topics in the listing form | `web/src/lib/types.ts` → `CATEGORIES` | Trainers can also choose "Other" and type a topic (max length: `MAX_CUSTOM_TOPIC_LENGTH` in `config/catalog.ts`). |
| Grade bands | `web/src/lib/types.ts` → `Grade`, `GRADES` | Update both. |
| Delivery formats | `web/src/lib/types.ts` → `Format`, `FORMATS` | Update both. |
| Default filter state | `web/src/lib/types.ts` → `DEFAULT_FILTERS` | |
| Colours (palette) | `web/src/app/globals.css` → `:root` variables | e.g. `--purple`; hero band colour: `--hero-bg`. |
| Fonts | `web/src/app/layout.tsx` (loading) + `globals.css` `--body-font` / `--head-font` | |
| Header height / sticky behaviour | `web/src/app/globals.css` → `header { ... }` | Mobile override in the `@media (max-width: 730px)` block. |
| Phone / tablet layout | `web/src/app/globals.css` → "Responsive" section at the end | Breakpoints: 1050px tablet, 730px phone, 480px small phone. |
| Mobile filter toggle | `web/src/components/FilterSidebar.tsx` | Collapsed on phones only. |
| Header search (look, animation) | `web/src/app/globals.css` → `.header-search`, `.search-compact` | When it appears: `HomePage.tsx` (`useIsOffscreen`). |
| Search box text / placeholder | `web/src/components/SearchBox.tsx` | |
| Hero headline and text | `web/src/components/Hero.tsx` | |
| Footer links (add / rename / remove) | `web/src/config/site.ts` → `FOOTER_COLUMNS` | A "Coming soon" page is created automatically for each link. |
| Footer social icons (URLs, add / remove) | `web/src/config/site.ts` → `SOCIAL_LINKS` | URLs are placeholders until the accounts exist. New platform: add its icon in `components/SocialIcon.tsx`. |
| Phone menu (☰) | `web/src/components/SiteHeader.tsx`, CSS `.menu-toggle` + 730px block | |
| Footer copyright year | `web/src/config/site.ts` → `copyrightYear` | |
| Price / grade display format | `web/src/lib/format.ts` | |
| Search / filter / sort logic | `web/src/lib/filter-courses.ts` | |
| Where course data comes from (database) | `web/src/lib/data/course-repository.ts` → `getCourseRepository()` | See recipe below. |
| Sample courses (temporary) | `web/src/lib/data/sample-courses.ts` | Removed in Step 3. |
| Required PR reviewer | `.github/CODEOWNERS` | |
| Files git ignores | `.gitignore` | |

---

## Recipes

### Add a suggested topic
1. Add the name to `CATEGORIES` in `web/src/lib/types.ts`.
2. Topics are free text, so no database change is needed for new topics.

### Add a footer page
1. Add `{label, href}` to a column in `FOOTER_COLUMNS` (`web/src/config/site.ts`). The footer link and a "Coming soon" page appear automatically.
2. When the real content is ready, create `web/src/app/<path>/page.tsx` (e.g. `app/about/page.tsx`). It replaces the placeholder for that path.

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
