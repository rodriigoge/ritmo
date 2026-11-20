-- Ritmo: user-defined order of habits on the Home.
--
-- Each habit gets a position (0, 1, 2… per user). New habits go to the end
-- automatically, and reorder_habits() saves a whole new order at once.

alter table public.habits add column position integer;

-- Existing habits keep the order they had: creation order.
update public.habits as h
set position = ordered.rank
from (
  select id,
         row_number() over (partition by user_id order by created_at, id) - 1
           as rank
  from public.habits
) as ordered
where h.id = ordered.id;

create function public.set_habit_position()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.position is null then
    -- Rows inserted earlier by the same statement (an import) are visible
    -- here, so a batch is numbered in sequence.
    select coalesce(max(position), -1) + 1
      into new.position
      from public.habits
     where user_id = new.user_id;
  end if;
  return new;
end;
$$;

create trigger habits_set_position
  before insert on public.habits
  for each row execute function public.set_habit_position();

-- NOT NULL is checked after the BEFORE trigger fills the value in.
alter table public.habits alter column position set not null;

create index habits_user_id_position_idx
  on public.habits (user_id, position);

-- Saves a new order: p_ids lists the caller's habit ids, first to last.
-- security invoker + RLS: ids of other users simply match no rows.
create function public.reorder_habits(p_ids uuid[])
returns void
language sql
security invoker
set search_path = ''
as $$
  update public.habits as h
     set position = o.ordinality - 1
    from unnest(p_ids) with ordinality as o(id, ordinality)
   where h.id = o.id
     and h.position is distinct from o.ordinality - 1;
$$;

revoke all on function public.reorder_habits(uuid[]) from public, anon;
grant execute on function public.reorder_habits(uuid[]) to authenticated;
