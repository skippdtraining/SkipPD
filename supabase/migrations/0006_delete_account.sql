-- Step 4 follow-up: users can delete their own account.
--
-- The app first removes the user's certification files through the Storage
-- API (Supabase does not allow deleting storage files from SQL), then calls
-- delete_my_account(). Deleting the auth.users row removes `profiles`,
-- `trainer_profiles` and `school_profiles` through ON DELETE CASCADE.
--
-- Run once in the SQL Editor.

-- Lets users delete files in their own certification folder.
create policy "Users delete their own certification"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'certifications'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Deletes the signed-in user's account. It can only ever delete the
-- caller: the id comes from the session, not from a parameter.
create function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
begin
  if caller is null then
    raise exception 'Not signed in.';
  end if;
  delete from auth.users where id = caller;
end;
$$;

revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
