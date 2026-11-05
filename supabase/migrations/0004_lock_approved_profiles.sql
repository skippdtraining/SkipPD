-- Step 4 follow-up: lock identity fields once a profile is approved.
--
-- Why: otherwise someone could get approved, then rename themselves to
-- another trainer or school and borrow their reputation.
-- - Approved trainer (certification_status = 'approved'): full_name locked.
-- - Approved school (school_status = 'approved'): school_name locked.
-- Other fields stay editable. The admin can still change everything in the
-- Supabase dashboard: these checks only apply to signed-in users of the site.
--
-- Run once in the SQL Editor.

create function public.lock_approved_profile_name()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Dashboard / SQL Editor requests have no signed-in user: allow.
  if (select auth.role()) is distinct from 'authenticated' then
    return new;
  end if;
  if new.full_name is distinct from old.full_name
    and old.role = 'trainer'
    and exists (
      select 1 from public.trainer_profiles
      where id = old.id and certification_status = 'approved'
    ) then
    raise exception 'This field is locked after approval. Contact us to change it.';
  end if;
  return new;
end;
$$;

create trigger profiles_lock_approved
  before update on public.profiles
  for each row execute function public.lock_approved_profile_name();

create function public.lock_approved_school_name()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.role()) is distinct from 'authenticated' then
    return new;
  end if;
  if new.school_name is distinct from old.school_name and old.school_status = 'approved' then
    raise exception 'This field is locked after approval. Contact us to change it.';
  end if;
  return new;
end;
$$;

create trigger school_profiles_lock_approved
  before update on public.school_profiles
  for each row execute function public.lock_approved_school_name();
