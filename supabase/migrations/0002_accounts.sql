-- Step 4: accounts and profiles.
--
-- Sign-in itself is handled by Supabase Auth (table auth.users). This file
-- adds what SkipPD needs on top:
-- - `profiles`: one row per account, with the account type (trainer or
--   school) and the details asked at sign-up;
-- - `school_email_domains`: extra school domains the admin trusts;
-- - the private `certifications` storage bucket for trainers' PD
--   certification files.
--
-- Review fields (certification_status, school_status) can only be changed
-- by the admin in the Supabase dashboard; users cannot write them.
--
-- Run once in the Supabase dashboard: SQL Editor > New query > paste > Run.

-- Domains (e.g. 'browardschools.com') that count as school email, on top
-- of the built-in patterns in is_likely_school_email(). Edit in the
-- dashboard. No API access: Row Level Security is on with no policies.
create table public.school_email_domains (
  domain text primary key check (domain = lower(domain)),
  note text not null default ''
);

alter table public.school_email_domains enable row level security;

-- True for emails that look like a school address: *.edu, US K-12 domains
-- (*.k12.xx.us) or a domain listed in school_email_domains (subdomains
-- included). Only a hint for the admin; approval stays manual.
create function public.is_likely_school_email(email text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  with parts as (select lower(split_part(email, '@', 2)) as domain)
  select
    parts.domain ~ '(^|\.)edu$'
    or parts.domain ~ '\.k12\.[a-z]{2}\.us$'
    or exists (
      select 1
      from public.school_email_domains listed
      where parts.domain = listed.domain or parts.domain like '%.' || listed.domain
    )
  from parts
$$;

-- One row per account. Columns for the other account type stay empty.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('trainer', 'school')),
  full_name text not null check (char_length(full_name) between 1 and 100),
  -- Copied from auth.users by a trigger so the admin sees it in this table.
  email text not null default '',

  -- Trainer fields.
  credentials text not null default '' check (char_length(credentials) <= 150),
  is_employed boolean,
  employer text not null default '' check (char_length(employer) <= 150),
  bio text not null default '' check (char_length(bio) <= 2000),
  -- Path inside the `certifications` bucket: '<user id>/<file name>'.
  certification_path text,
  -- 'none' = no file; 'pending' = uploaded, waiting for the admin.
  certification_status text not null default 'none'
    check (certification_status in ('none', 'pending', 'approved', 'rejected')),

  -- School fields.
  school_name text not null default '' check (char_length(school_name) <= 150),
  contact_position text not null default '' check (char_length(contact_position) <= 100),
  -- Set by a trigger from the email; a hint for the admin, not a decision.
  is_likely_school_email boolean not null default false,
  school_status text not null default 'pending'
    check (school_status in ('pending', 'approved', 'rejected')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Fills server-owned columns so users cannot fake them:
-- email + school-email hint, review status after a new upload, timestamps.
create function public.prepare_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' and new.role <> old.role then
    raise exception 'The account type cannot be changed.';
  end if;

  if new.certification_path is not null
    and split_part(new.certification_path, '/', 1) <> new.id::text then
    raise exception 'Certification file must be in your own folder.';
  end if;

  select users.email into new.email from auth.users where users.id = new.id;
  new.email := coalesce(new.email, '');
  new.is_likely_school_email := public.is_likely_school_email(new.email);

  -- A new or replaced file needs a fresh review.
  if new.certification_path is null then
    new.certification_status := 'none';
  elsif tg_op = 'INSERT' or new.certification_path is distinct from old.certification_path then
    new.certification_status := 'pending';
  end if;

  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_prepare
  before insert or update on public.profiles
  for each row execute function public.prepare_profile();

-- Users read, create and edit only their own profile, and only the columns
-- listed below. Review status columns are left out on purpose.
alter table public.profiles enable row level security;

revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant insert (id, role, full_name, credentials, is_employed, employer, bio,
  certification_path, school_name, contact_position)
  on public.profiles to authenticated;
grant update (full_name, credentials, is_employed, employer, bio,
  certification_path, school_name, contact_position)
  on public.profiles to authenticated;

create policy "Users read their own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

create policy "Users create their own profile"
  on public.profiles for insert to authenticated
  with check ((select auth.uid()) = id);

create policy "Users update their own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Private bucket for PD certification files. Limits match
-- MAX_CERTIFICATION_BYTES and CERTIFICATION_TYPES in web/src/config/accounts.ts.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'certifications',
  'certifications',
  false,
  4194304,
  array['application/pdf', 'image/jpeg', 'image/png']
);

-- Each user may only upload to and read from the folder named after their id.
create policy "Users upload their own certification"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'certifications'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users read their own certification"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'certifications'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
