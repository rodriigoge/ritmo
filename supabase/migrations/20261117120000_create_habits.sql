-- Ritmo: habits and daily completions, owned by the signed-in user.
-- Every row carries user_id, and row level security limits each user to
-- their own rows. The app only ever uses the publishable key plus the
-- user's session, so these policies are the real access boundary.

create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
  name text not null
    check (name = btrim(name) and char_length(name) between 1 and 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index habits_user_id_created_at_idx
  on public.habits (user_id, created_at);

create table public.habit_completions (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits (id) on delete cascade,
  user_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
  date date not null,
  created_at timestamptz not null default now(),
  unique (habit_id, date)
);

create index habit_completions_user_id_idx
  on public.habit_completions (user_id);

alter table public.habits enable row level security;
alter table public.habit_completions enable row level security;

create policy "Users read their own habits"
  on public.habits for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Users create their own habits"
  on public.habits for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Users update their own habits"
  on public.habits for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Users delete their own habits"
  on public.habits for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users read their own completions"
  on public.habit_completions for select to authenticated
  using ((select auth.uid()) = user_id);
-- A completion may only point at a habit the same user owns.
create policy "Users create completions on their own habits"
  on public.habit_completions for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.habits h
      where h.id = habit_id and h.user_id = (select auth.uid())
    )
  );
create policy "Users delete their own completions"
  on public.habit_completions for delete to authenticated
  using ((select auth.uid()) = user_id);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger habits_set_updated_at
  before update on public.habits
  for each row execute function public.set_updated_at();

-- Marks or unmarks one day in a single round trip and transaction.
-- Returns true when the day ends up completed. Runs as the caller, so the
-- policies above still apply.
create function public.toggle_habit_completion(p_habit_id uuid, p_date date)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  removed integer;
begin
  if not exists (select 1 from public.habits where id = p_habit_id) then
    raise exception 'Habit not found.' using errcode = 'P0002';
  end if;

  delete from public.habit_completions
    where habit_id = p_habit_id and date = p_date;
  get diagnostics removed = row_count;
  if removed > 0 then
    return false;
  end if;

  -- The app checks "today" in the user's own time zone; the server only
  -- rejects dates that are in the future for every time zone.
  if p_date > (now() at time zone 'utc')::date + 1 then
    raise exception 'Completion date cannot be in the future.'
      using errcode = '22023';
  end if;

  insert into public.habit_completions (habit_id, date)
    values (p_habit_id, p_date);
  return true;
end;
$$;

revoke execute on function public.toggle_habit_completion(uuid, date)
  from public, anon;
grant execute on function public.toggle_habit_completion(uuid, date)
  to authenticated;
