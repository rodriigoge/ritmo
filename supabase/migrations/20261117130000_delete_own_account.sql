-- Ritmo: lets a signed-in user permanently delete their own account.
-- Removing the auth.users row cascades to habits and habit_completions
-- (both reference auth.users with on delete cascade).
--
-- security definer is required because regular users cannot touch the
-- auth schema. The function only ever deletes the caller (auth.uid()),
-- so it cannot be used against anyone else.

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := auth.uid();
begin
  if caller is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  delete from auth.users where id = caller;
end;
$$;

revoke all on function public.delete_own_account() from public, anon;
grant execute on function public.delete_own_account() to authenticated;
