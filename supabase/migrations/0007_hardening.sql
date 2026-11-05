-- Step 4 review fixes (security and reliability).
--
-- 1. Name lock survives a re-review: once a trainer was approved, their
--    name stays locked even if a new certificate resets the status.
-- 2. The school-domain check can no longer be called through the API.
-- 3. Only trainers may upload certification files, at most 10 each.
-- 4. A changed account email is copied to `profiles` (and the school hint).
-- 5. save_my_profile(): saves the profile and its details in one
--    transaction, so a failure can never leave half a profile.
--
-- Run once in the SQL Editor.

-- 1. Name lock based on "was ever approved", not the current status.
alter table public.trainer_profiles
  add column ever_approved boolean not null default false;
alter table public.school_profiles
  add column ever_approved boolean not null default false;

update public.trainer_profiles set ever_approved = true where certification_status = 'approved';
update public.school_profiles set ever_approved = true where school_status = 'approved';

-- Users have no grant on ever_approved; only this trigger sets it.
create function public.remember_approval()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_table_name = 'trainer_profiles' then
    new.ever_approved := (tg_op = 'UPDATE' and old.ever_approved)
      or new.certification_status = 'approved';
  else
    new.ever_approved := (tg_op = 'UPDATE' and old.ever_approved)
      or new.school_status = 'approved';
  end if;
  return new;
end;
$$;

-- "z_" so it runs after the triggers that set the status (name order).
create trigger z_trainer_profiles_remember_approval
  before insert or update on public.trainer_profiles
  for each row execute function public.remember_approval();
create trigger z_school_profiles_remember_approval
  before insert or update on public.school_profiles
  for each row execute function public.remember_approval();

create or replace function public.lock_approved_profile_name()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.role()) is distinct from 'authenticated' then
    return new;
  end if;
  if new.full_name is distinct from old.full_name
    and old.role = 'trainer'
    and exists (
      select 1 from public.trainer_profiles where id = old.id and ever_approved
    ) then
    raise exception 'This field is locked after approval. Contact us to change it.';
  end if;
  return new;
end;
$$;

create or replace function public.lock_approved_school_name()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.role()) is distinct from 'authenticated' then
    return new;
  end if;
  if new.school_name is distinct from old.school_name and old.ever_approved then
    raise exception 'This field is locked after approval. Contact us to change it.';
  end if;
  return new;
end;
$$;

-- 2. Internal only: triggers still call it (they run as the owner).
revoke execute on function public.is_likely_school_email(text) from public, anon, authenticated;

-- 3. Trainer-only uploads with a per-user cap.
create function public.can_upload_certification()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    exists (
      select 1 from public.profiles where id = (select auth.uid()) and role = 'trainer'
    )
    and (
      select count(*) from storage.objects
      where bucket_id = 'certifications'
        and (storage.foldername(name))[1] = (select auth.uid())::text
    ) < 10
$$;

revoke execute on function public.can_upload_certification() from public, anon;
grant execute on function public.can_upload_certification() to authenticated;

drop policy "Users upload their own certification" on storage.objects;
create policy "Trainers upload their own certification"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'certifications'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and public.can_upload_certification()
  );

-- 4. Keep profiles.email (and the school hint) in sync with auth.users.
create function public.sync_profile_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles set email = new.email where id = new.id;
  -- Touching the row re-runs prepare_school_profile, which recomputes the hint.
  update public.school_profiles set school_name = school_name where id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_email_change
  after update of email on auth.users
  for each row execute function public.sync_profile_email();

-- 5. One-transaction profile save. Security invoker: the caller's grants
-- and Row Level Security still apply, exactly as before.
create function public.save_my_profile(
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

revoke execute on function public.save_my_profile(
  text, text, text, boolean, text, text, text, text, text, text
) from public, anon;
grant execute on function public.save_my_profile(
  text, text, text, boolean, text, text, text, text, text, text
) to authenticated;
