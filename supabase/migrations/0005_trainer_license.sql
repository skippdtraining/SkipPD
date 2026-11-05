-- Step 4 follow-up: optional teaching license for trainers.
--
-- The PD-trainer certificate (PDF) stays. The license is separate: the
-- trainer enters the issuing US state and license number; the admin checks
-- them on that state's public lookup site and sets license_status.
-- - Changing the state or number resets the review to 'pending'.
-- - Once approved, both fields are locked for site users (admin can still
--   edit them in the dashboard).
--
-- Run once in the SQL Editor.

alter table public.trainer_profiles
  add column license_state text not null default ''
    check (license_state = '' or license_state ~ '^[A-Z]{2}$'),
  add column license_number text not null default ''
    check (char_length(license_number) <= 50),
  -- 'none' = nothing entered; 'pending' = waiting for the admin.
  add column license_status text not null default 'none'
    check (license_status in ('none', 'pending', 'approved', 'rejected'));

grant insert (license_state, license_number) on public.trainer_profiles to authenticated;
grant update (license_state, license_number) on public.trainer_profiles to authenticated;

-- Sets the review status when the license changes.
create function public.prepare_trainer_license()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.license_state = '' or new.license_number = '' then
    new.license_status := 'none';
  elsif tg_op = 'INSERT'
    or new.license_state is distinct from old.license_state
    or new.license_number is distinct from old.license_number then
    new.license_status := 'pending';
  end if;
  return new;
end;
$$;

create trigger trainer_profiles_license
  before insert or update on public.trainer_profiles
  for each row execute function public.prepare_trainer_license();

-- Locks an approved license for site users.
create function public.lock_approved_license()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.role()) is distinct from 'authenticated' then
    return new;
  end if;
  if old.license_status = 'approved'
    and (new.license_state is distinct from old.license_state
      or new.license_number is distinct from old.license_number) then
    raise exception 'This field is locked after approval. Contact us to change it.';
  end if;
  return new;
end;
$$;

-- Name starts with "a" so it runs before trainer_profiles_license
-- (Postgres runs triggers in name order) and sees the old status.
create trigger a_trainer_profiles_lock_license
  before update on public.trainer_profiles
  for each row execute function public.lock_approved_license();
