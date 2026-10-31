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
| Max learning outcomes / outcome length | `web/src/config/catalog.ts` → `MAX_OUTCOMES`, `MAX_OUTCOME_LENGTH` | |
| Image upload size / allowed types | `web/src/config/catalog.ts` → `MAX_IMAGE_BYTES`, `IMAGE_TYPES` | |
| Suggested topics in the listing form | Supabase table `categories` (`name`, `sort_order`) | Trainers can also choose "Other" and type a topic (max length: `MAX_CUSTOM_TOPIC_LENGTH` in `config/catalog.ts`). |
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
| Search / filter / sort logic | `web/src/lib/data/supabase-course-repository.ts` → `searchCourses` | Runs in the database. Browser-only listings use the same rules in `lib/filter-courses.ts`; keep both in sync. |
| Search delay while typing | `web/src/config/catalog.ts` → `SEARCH_DEBOUNCE_MS` | |
| Course content (title, price, outcomes...) | Supabase dashboard → Table Editor → `listings` | Live on next page load. Set `is_published` to false to hide a course; `recommended_rank` orders "Recommended". |
| Database tables / seed data | `supabase/migrations/*.sql`, `supabase/seed.sql` | See "Supabase setup" recipe. |
| Supabase URL / key | `web/.env.local` (local), Vercel → Settings → Environment Variables | `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`. Template: `web/.env.example`. |
| Where course data comes from (database) | `web/src/lib/data/course-repository.ts` → `getCourseRepository()` | See recipe below. |
| Password length, profile field limits, certification file size/types | `web/src/config/accounts.ts` | Also change the matching limit in the database (new migration). |
| Page opened after sign-in | `web/src/config/accounts.ts` → `AFTER_SIGN_IN_PATH` | |
| Account type labels / hints | `web/src/lib/types.ts` → `ACCOUNT_ROLES` | |
| Profile form fields | `web/src/components/ProfileForm.tsx` + `lib/profile-form.ts` (validation) + `lib/data/supabase-profile-repository.ts` (columns) | New column needs a migration: common fields in `profiles`, others in `trainer_profiles` or `school_profiles`. |
| Review status wording ("Not certified"...) | `web/src/components/AccountStatus.tsx` | |
| Who can save / book / list | `web/src/components/HomePage.tsx` → `withAccount`, `openListingForm` | Guest header items: `components/SiteHeader.tsx`. |
| Sign-in vendor | `web/src/lib/auth/auth-service.ts` → `getAuthService()` | Same pattern as the database. |
| Approve a certification or school | Supabase dashboard → `trainer_profiles` / `school_profiles` | See recipe below. |
| Extra school email domains | Supabase dashboard → `school_email_domains` | See recipe below. |
| Required PR reviewer | `.github/CODEOWNERS` | |
| Files git ignores | `.gitignore` | |

---

## Recipes

### Add a suggested topic
1. Supabase dashboard → Table Editor → `categories` → Insert row (`name`, `sort_order`).
2. Topics are free text on listings, so existing listings need no change.

### Supabase setup (new project or new environment)
1. Supabase dashboard → SQL Editor → New query: paste and run each file in `supabase/migrations/` in order.
2. Run `supabase/seed.sql` the same way to load the starter topics and courses. It empties both tables first.
3. Copy `web/.env.example` to `web/.env.local` and fill in the Project URL and publishable key (Project Settings → API Keys).
4. Vercel → Project → Settings → Environment Variables: add `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` for Production and Preview, then redeploy.
5. Never use the secret (service role) key in this app. It bypasses Row Level Security.

### Accounts setup (Supabase Auth, once per project)
1. SQL Editor: run `supabase/migrations/0002_accounts.sql`.
2. Authentication → Sign In / Providers → Email: keep **Confirm email** on. Set minimum password length to 8 (`MIN_PASSWORD_LENGTH`).
3. Authentication → URL Configuration (where Supabase may send users back to):
   - **Site URL**: the production address, e.g. `https://<your-site>.vercel.app`.
   - **Redirect URLs**: `http://localhost:3000/**`, `https://skip-*-skip-pd.vercel.app/**` (all Vercel previews) and the production address followed by `/**`.
   - In these patterns `*` matches any characters except `.` and `/`; `/**` matches any path.
4. Google sign-in (Google Cloud Console, https://console.cloud.google.com, free, no billing needed):
   1. Project picker → **New project** → name `SkipPD` → Create, and select it.
   2. Search **Google Auth Platform** (older: OAuth consent screen) → Get started: app name `SkipPD`, support email, Audience **External**, contact email → Create.
   3. **Clients** → Create client → **Web application**, name `SkipPD web`. Under **Authorized redirect URIs** add only `https://zlkbjqhywukharqnyizd.supabase.co/auth/v1/callback`. Google always returns to Supabase, so previews and localhost are not listed here.
   4. Copy the Client ID and Client secret into Supabase → Authentication → Sign In / Providers → Google, enable, Save. Never put the secret in code or Vercel.
   5. New apps are in **Testing**: only accounts under Audience → Test users can sign in. Click **Publish app** before launch.
5. Email links (Authentication → Emails → Templates). Change the link in two templates so links work even when opened in another browser or mail app:
   - **Confirm signup**: `<a href="{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=email">Confirm your email</a>`
   - **Reset password**: `<a href="{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=recovery">Reset your password</a>`
   - `RedirectTo` already contains `/auth/callback?next=...`, hence `&` not `?`.
6. Emails: Supabase's built-in sender allows only a few emails per hour, for testing. Before launch, set up custom SMTP (Authentication → Emails → SMTP), e.g. Resend or SendGrid.

### Approve a certification or school
1. Find the user's id: Table Editor → `profiles` → `id` column of their row (the `email` column helps).
2. Storage → `certifications` → open the folder with that id → click the file → **Download** (or **Get URL** for a link valid for a limited time).
3. Trainers: Table Editor → `trainer_profiles` → same `id` → set `certification_status` to `approved` or `rejected`. Schools: `school_profiles` → check `is_likely_school_email`, then set `school_status`. Click **Save** in the dashboard.
4. The user sees the new status on `/account` at once. Step 5 moves this into an admin page.

### Verify a trainer's teaching license
1. Table Editor → `trainer_profiles` → rows with `license_status` = `pending`; note `license_state` and `license_number`.
2. Open that state's public educator license lookup (search "<state> teacher certification lookup") and check that the number exists, is active and matches the trainer's name in `profiles`.
3. Set `license_status` to `approved` or `rejected` → Save. Once approved, the license fields are locked for the trainer.

### Change a locked field for a user
After approval, a trainer's name and a school's name are locked on the site (rule: `web/src/lib/profile-locks.ts` + `supabase/migrations/0004_lock_approved_profiles.sql`; change both together).
1. Trainer name: Table Editor → `profiles` → edit `full_name` → Save.
2. License: `trainer_profiles` → `license_state` / `license_number` (editing them resets `license_status` to `pending`; set it back to `approved` if correct).
3. School name: Table Editor → `school_profiles` → edit `school_name` → Save.

### Add a school email domain
1. Table Editor → `school_email_domains` → Insert row: `domain` in lower case, e.g. `browardschools.com` (subdomains count too).
2. Existing profiles update their hint the next time they are saved.

### Change the database schema
1. Add a new numbered file, e.g. `supabase/migrations/0002_<topic>.sql`. Never edit a migration that was already run.
2. Run it in the SQL Editor.
3. Update `ListingRow` / `toCourse` in `web/src/lib/data/supabase-course-repository.ts`, and `lib/types.ts` if the app type changes.

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
