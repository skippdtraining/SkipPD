-- Names can never be changed by users once the profile exists, approved or
-- not: trainer full_name and school school_name. (School contact name and
-- position stay editable.) The admin can still edit them in the dashboard.
--
-- Run once in the SQL Editor.

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
  if new.full_name is distinct from old.full_name and old.role = 'trainer' then
    raise exception 'This field cannot be changed. Contact us to change it.';
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
  if new.school_name is distinct from old.school_name then
    raise exception 'This field cannot be changed. Contact us to change it.';
  end if;
  return new;
end;
$$;
