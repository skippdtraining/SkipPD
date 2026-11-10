-- Step 5 review fixes (security and reliability).
--
-- 1. Reviews only apply to items that are still pending, and certificates
--    only if the file is the one the admin opened (no approving an unseen
--    re-upload from a stale page).
-- 2. Admin accounts cannot get a profile by any route, and an account with
--    a profile cannot be made admin.
-- 3. Admin checks in policies run once per query, not once per row.
-- 4. "Submitted" dates: set when an item enters review, not on any edit.
--
-- Run once in the SQL Editor.

-- 4. Submission timestamps.
alter table public.trainer_profiles
  add column certification_submitted_at timestamptz,
  add column license_submitted_at timestamptz;
alter table public.school_profiles
  add column school_submitted_at timestamptz not null default now();

update public.trainer_profiles set certification_submitted_at = updated_at
  where certification_status = 'pending';
update public.trainer_profiles set license_submitted_at = updated_at
  where license_status = 'pending';
update public.school_profiles set school_submitted_at = created_at
  from public.profiles where profiles.id = school_profiles.id;

create function public.stamp_trainer_submission()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.certification_status = 'pending'
    and (tg_op = 'INSERT' or old.certification_status <> 'pending'
      or new.certification_path is distinct from old.certification_path) then
    new.certification_submitted_at := now();
  end if;
  if new.license_status = 'pending'
    and (tg_op = 'INSERT' or old.license_status <> 'pending'
      or new.license_number is distinct from old.license_number
      or new.license_state is distinct from old.license_state) then
    new.license_submitted_at := now();
  end if;
  return new;
end;
$$;

-- "x_" so it runs after the triggers that set the statuses (name order).
create trigger x_trainer_profiles_stamp_submission
  before insert or update on public.trainer_profiles
  for each row execute function public.stamp_trainer_submission();

-- 1. Pending-only reviews, with the certificate path the admin saw.
drop function public.review_profile(uuid, text, text, text);

create function public.review_profile(
  p_user uuid,
  p_item text,
  p_decision text,
  p_reason text,
  p_expected_path text default null
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
      where id = p_user
        and certification_status = 'pending'
        and certification_path is not distinct from p_expected_path;
  elsif p_item = 'license' then
    update public.trainer_profiles
      set license_status = p_decision, license_reason = reason
      where id = p_user and license_status = 'pending';
  elsif p_item = 'school' then
    update public.school_profiles
      set school_status = p_decision, school_reason = reason
      where id = p_user and school_status = 'pending';
  else
    raise exception 'Unknown review item.';
  end if;

  if not found then
    raise exception 'This request changed or was already reviewed.';
  end if;
end;
$$;

revoke execute on function public.review_profile(uuid, text, text, text, text)
  from public, anon;
grant execute on function public.review_profile(uuid, text, text, text, text)
  to authenticated;

-- 2. No profiles for admins, no admins with profiles.
create function public.block_admin_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (select 1 from public.admins where id = new.id) then
    raise exception 'Admin accounts have no profile.';
  end if;
  return new;
end;
$$;

create trigger profiles_block_admin
  before insert on public.profiles
  for each row execute function public.block_admin_profile();

create function public.block_admin_with_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (select 1 from public.profiles where id = new.id) then
    raise exception 'This account has a trainer/school profile; use a separate admin account.';
  end if;
  return new;
end;
$$;

create trigger admins_block_profile_owner
  before insert on public.admins
  for each row execute function public.block_admin_with_profile();

-- 3. Evaluate is_admin() once per query.
alter policy "Admins read all profiles" on public.profiles
  using ((select public.is_admin()));
alter policy "Admins read all trainer details" on public.trainer_profiles
  using ((select public.is_admin()));
alter policy "Admins read all school details" on public.school_profiles
  using ((select public.is_admin()));
alter policy "Admins read all certifications" on storage.objects
  using (bucket_id = 'certifications' and (select public.is_admin()));

-- 5. A rejected school that edits its details goes back to review (the
-- old reason is cleared), so it has a way forward from the site.
create function public.resubmit_rejected_school()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.role()) = 'authenticated'
    and old.school_status = 'rejected'
    and (new.contact_position is distinct from old.contact_position) then
    new.school_status := 'pending';
    new.school_reason := '';
    new.school_submitted_at := now();
  end if;
  return new;
end;
$$;

create trigger x_school_profiles_resubmit
  before update on public.school_profiles
  for each row execute function public.resubmit_rejected_school();
