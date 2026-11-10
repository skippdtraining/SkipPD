-- Step 5: admin role and review from the site.
--
-- - `admins`: accounts allowed to review. Rows are added only in the SQL
--   Editor (no API write access), so nobody can make themselves admin.
--   Admin accounts are separate from trainer/school accounts.
-- - Admins can read every profile and certification file.
-- - review_profile(): the only way to approve/reject from the site, with an
--   optional reason the user sees on their account page.
-- - A new upload or license change clears the old reason.
--
-- Run once in the SQL Editor. Then make your admin account: see HOW-TO
-- "Create the admin account".

create table public.admins (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;
revoke all on public.admins from anon, authenticated;
grant select on public.admins to authenticated;

-- Users can only see their own row, i.e. learn whether they are admin.
create policy "Users see whether they are admin"
  on public.admins for select to authenticated
  using ((select auth.uid()) = id);

-- True when the signed-in user is an admin. Security definer so policies
-- can call it without exposing the admins table.
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where id = (select auth.uid()))
$$;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- Rejection reasons shown to the user.
alter table public.trainer_profiles
  add column certification_reason text not null default ''
    check (char_length(certification_reason) <= 500),
  add column license_reason text not null default ''
    check (char_length(license_reason) <= 500);
alter table public.school_profiles
  add column school_reason text not null default ''
    check (char_length(school_reason) <= 500);

-- Clear an old reason once the item goes back to review.
create function public.clear_review_reasons()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.certification_status = 'pending' and old.certification_status <> 'pending' then
    new.certification_reason := '';
  end if;
  if new.license_status = 'pending' and old.license_status <> 'pending' then
    new.license_reason := '';
  end if;
  return new;
end;
$$;

-- "y_" so it runs after the triggers that set the statuses (name order).
create trigger y_trainer_profiles_clear_reasons
  before update on public.trainer_profiles
  for each row execute function public.clear_review_reasons();

-- Admins read everything needed for review.
create policy "Admins read all profiles"
  on public.profiles for select to authenticated
  using (public.is_admin());
create policy "Admins read all trainer details"
  on public.trainer_profiles for select to authenticated
  using (public.is_admin());
create policy "Admins read all school details"
  on public.school_profiles for select to authenticated
  using (public.is_admin());
create policy "Admins read all certifications"
  on storage.objects for select to authenticated
  using (bucket_id = 'certifications' and public.is_admin());

-- Approve or reject one item. Runs as the owner (review columns have no
-- user grants), but only after checking the caller is an admin.
create function public.review_profile(
  p_user uuid,
  p_item text,
  p_decision text,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  reason text := left(coalesce(p_reason, ''), 500);
begin
  if not public.is_admin() then
    raise exception 'Only admins can review.';
  end if;
  if p_decision not in ('approved', 'rejected') then
    raise exception 'Unknown decision.';
  end if;
  if p_decision = 'approved' then
    reason := '';
  end if;

  if p_item = 'certification' then
    update public.trainer_profiles
      set certification_status = p_decision, certification_reason = reason
      where id = p_user and certification_path is not null;
  elsif p_item = 'license' then
    update public.trainer_profiles
      set license_status = p_decision, license_reason = reason
      where id = p_user and license_number <> '';
  elsif p_item = 'school' then
    update public.school_profiles
      set school_status = p_decision, school_reason = reason
      where id = p_user;
  else
    raise exception 'Unknown review item.';
  end if;

  if not found then
    raise exception 'Nothing to review for this user.';
  end if;
end;
$$;

revoke execute on function public.review_profile(uuid, text, text, text) from public, anon;
grant execute on function public.review_profile(uuid, text, text, text) to authenticated;

-- Admin accounts never get a trainer/school profile.
create or replace function public.save_my_profile(
  p_role text,
  p_full_name text,
  p_credentials text,
  p_is_employed boolean,
  p_employer text,
  p_bio text,
  p_license_state text,
  p_license_number text,
  p_school_name text,
  p_contact_position text
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  account_role text;
begin
  if caller is null then
    raise exception 'Not signed in.';
  end if;
  if public.is_admin() then
    raise exception 'Admin accounts have no profile.';
  end if;

  select role into account_role from public.profiles where id = caller;
  if found then
    update public.profiles set full_name = p_full_name where id = caller;
  else
    insert into public.profiles (id, role, full_name) values (caller, p_role, p_full_name);
    account_role := p_role;
  end if;

  if account_role = 'trainer' then
    insert into public.trainer_profiles
      (id, credentials, is_employed, employer, bio, license_state, license_number)
    values
      (caller, p_credentials, p_is_employed, p_employer, p_bio, p_license_state, p_license_number)
    on conflict (id) do update set
      credentials = excluded.credentials,
      is_employed = excluded.is_employed,
      employer = excluded.employer,
      bio = excluded.bio,
      license_state = excluded.license_state,
      license_number = excluded.license_number;
  else
    insert into public.school_profiles (id, school_name, contact_position)
    values (caller, p_school_name, p_contact_position)
    on conflict (id) do update set
      school_name = excluded.school_name,
      contact_position = excluded.contact_position;
  end if;
end;
$$;
