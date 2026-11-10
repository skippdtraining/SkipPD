-- Step 6: listings belong to trainers (CRUD + image upload).
--
-- Adds the owner of each listing, an optional cover image path, and the
-- Row Level Security rules that let a trainer create, edit and delete only
-- their own listings. Also adds a public read-only view with the trainer's
-- certification / license badges, so the catalog can show them without
-- exposing the rest of `trainer_profiles`.
--
-- Run once in the Supabase dashboard: SQL Editor > New query > paste > Run.
-- Existing seed rows keep `owner_id` null: they are catalog samples with no
-- trainer account behind them.

-- Nullable: the six seed courses predate trainer accounts. Deleting an
-- account deletes its listings (the profile is already cascade-deleted).
alter table public.listings
  add column owner_id uuid references auth.users (id) on delete cascade,
  add column image_path text;

create index listings_owner_idx on public.listings (owner_id);

-- Row Level Security decides which rows; the grants decide which
-- operations exist for signed-in users at all.
grant insert, update, delete on public.listings to authenticated;

-- Certification / license badges for the catalog. A view runs with its
-- owner's rights, so this exposes exactly these three columns and nothing
-- else from `trainer_profiles` (bio, employer, license number stay private).
-- The Supabase linter reports it as a "security definer view" on purpose.
create view public.trainer_badges as
  select id as owner_id, certification_status, license_status
  from public.trainer_profiles;

grant select on public.trainer_badges to anon, authenticated;

-- Everyone can still read published listings (migration 0001). Trainers
-- also see their own unpublished ones, and admins see every listing.
create policy "Trainers read their own listings"
  on public.listings for select
  to authenticated
  using (owner_id = (select auth.uid()));

create policy "Admins read all listings"
  on public.listings for select
  to authenticated
  using ((select public.is_admin()));

-- Only trainers with a profile may create a listing, and only for
-- themselves. The trainer name and role are copied from the profile by the
-- app; the profile's role is re-checked here so a school account cannot
-- insert through the API.
create policy "Trainers create their own listings"
  on public.listings for insert
  to authenticated
  with check (
    owner_id = (select auth.uid())
    and exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'trainer'
    )
  );

-- `with check` repeats the rule so an owner cannot hand a listing to
-- somebody else by updating `owner_id`.
create policy "Trainers update their own listings"
  on public.listings for update
  to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy "Trainers delete their own listings"
  on public.listings for delete
  to authenticated
  using (owner_id = (select auth.uid()));

-- Public bucket for listing cover images, so guests see them in the
-- catalog. Limits match MAX_IMAGE_BYTES and IMAGE_TYPES in
-- web/src/config/catalog.ts.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listings',
  'listings',
  true,
  1048576,
  array['image/jpeg', 'image/png', 'image/webp']
);

-- Each trainer writes only inside the folder named after their user id.
create policy "Trainers upload their own listing images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'listings'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Trainers replace their own listing images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'listings'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'listings'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Trainers delete their own listing images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'listings'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
