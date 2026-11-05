-- Step 4 follow-up: give trainers and schools their own tables.
--
-- Before: one `profiles` table held both trainer and school columns, so
-- every row had empty columns for the other account type.
-- After:
-- - `profiles`: what every account has (role, name, email);
-- - `trainer_profiles`: trainer-only details and certification review;
-- - `school_profiles`: school-only details and school verification.
-- Each detail row uses the same id as its `profiles` row, and the database
-- rejects details that do not match the account type.
--
-- Existing data is copied over. Run once in the SQL Editor.

create table public.trainer_profiles (
  id uuid primary key references public.profiles (id) on delete cascade,
  credentials text not null default '' check (char_length(credentials) <= 150),
  is_employed boolean not null default false,
  employer text not null default '' check (char_length(employer) <= 150),
  bio text not null default '' check (char_length(bio) <= 2000),
  -- Path inside the `certifications` bucket: '<user id>/<file name>'.
  certification_path text,
  -- 'none' = no file; 'pending' = uploaded, waiting for the admin.
  certification_status text not null default 'none'
    check (certification_status in ('none', 'pending', 'approved', 'rejected')),
  updated_at timestamptz not null default now()
);

create table public.school_profiles (
  id uuid primary key references public.profiles (id) on delete cascade,
  school_name text not null default '' check (char_length(school_name) <= 150),
  contact_position text not null default '' check (char_length(contact_position) <= 100),
  -- Set by a trigger from the account email; a hint for the admin only.
  is_likely_school_email boolean not null default false,
  school_status text not null default 'pending'
    check (school_status in ('pending', 'approved', 'rejected')),
  updated_at timestamptz not null default now()
);

-- Copy existing data before the triggers exist, so review statuses are kept.
insert into public.trainer_profiles
  (id, credentials, is_employed, employer, bio, certification_path, certification_status)
select id, credentials, coalesce(is_employed, false), employer, bio,
  certification_path, certification_status
from public.profiles
where role = 'trainer';

insert into public.school_profiles
  (id, school_name, contact_position, is_likely_school_email, school_status)
select id, school_name, contact_position, is_likely_school_email, school_status
from public.profiles
where role = 'school';

-- The common table now only keeps role, name and email.
create or replace function public.prepare_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' and new.role <> old.role then
    raise exception 'The account type cannot be changed.';
  end if;
  select users.email into new.email from auth.users where users.id = new.id;
  new.email := coalesce(new.email, '');
  new.updated_at := now();
  return new;
end;
$$;

alter table public.profiles
  drop column credentials,
  drop column is_employed,
  drop column employer,
  drop column bio,
  drop column certification_path,
  drop column certification_status,
  drop column school_name,
  drop column contact_position,
  drop column is_likely_school_email,
  drop column school_status;

-- Trainer details: only for trainer accounts; a new file needs a new review.
create function public.prepare_trainer_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.profiles where id = new.id and role = 'trainer'
  ) then
    raise exception 'Only trainer accounts have trainer details.';
  end if;

  if new.certification_path is not null
    and split_part(new.certification_path, '/', 1) <> new.id::text then
    raise exception 'Certification file must be in your own folder.';
  end if;

  if new.certification_path is null then
    new.certification_status := 'none';
  elsif tg_op = 'INSERT' or new.certification_path is distinct from old.certification_path then
    new.certification_status := 'pending';
  end if;

  new.updated_at := now();
  return new;
end;
$$;

create trigger trainer_profiles_prepare
  before insert or update on public.trainer_profiles
  for each row execute function public.prepare_trainer_profile();

-- School details: only for school accounts; recompute the email hint.
create function public.prepare_school_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  account_email text;
begin
  select email into account_email
  from public.profiles
  where id = new.id and role = 'school';
  if not found then
    raise exception 'Only school accounts have school details.';
  end if;

  new.is_likely_school_email := public.is_likely_school_email(account_email);
  new.updated_at := now();
  return new;
end;
$$;

create trigger school_profiles_prepare
  before insert or update on public.school_profiles
  for each row execute function public.prepare_school_profile();

-- Users read, create and edit only their own details. Review columns
-- (certification_status, school_status, is_likely_school_email) are left
-- out of the grants on purpose: only the admin changes them.
alter table public.trainer_profiles enable row level security;
alter table public.school_profiles enable row level security;

revoke all on public.trainer_profiles from anon, authenticated;
revoke all on public.school_profiles from anon, authenticated;

grant select on public.trainer_profiles to authenticated;
grant insert (id, credentials, is_employed, employer, bio, certification_path)
  on public.trainer_profiles to authenticated;
grant update (credentials, is_employed, employer, bio, certification_path)
  on public.trainer_profiles to authenticated;

grant select on public.school_profiles to authenticated;
grant insert (id, school_name, contact_position) on public.school_profiles to authenticated;
grant update (school_name, contact_position) on public.school_profiles to authenticated;

create policy "Users read their own trainer details"
  on public.trainer_profiles for select to authenticated
  using ((select auth.uid()) = id);
create policy "Users create their own trainer details"
  on public.trainer_profiles for insert to authenticated
  with check ((select auth.uid()) = id);
create policy "Users update their own trainer details"
  on public.trainer_profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Users read their own school details"
  on public.school_profiles for select to authenticated
  using ((select auth.uid()) = id);
create policy "Users create their own school details"
  on public.school_profiles for insert to authenticated
  with check ((select auth.uid()) = id);
create policy "Users update their own school details"
  on public.school_profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
