-- Trips: saved per user, protected by Row Level Security.

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  title text not null,
  destination_slug text not null,
  start_date date not null,
  end_date date not null,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date >= start_date),
  check (char_length(title) between 1 and 120),
  check (char_length(notes) <= 2000)
);

create index if not exists trips_user_id_created_at_idx on public.trips (user_id, created_at desc);

-- Keep updated_at current on every update.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trips_set_updated_at on public.trips;
create trigger trips_set_updated_at
  before update on public.trips
  for each row execute function public.set_updated_at();

alter table public.trips enable row level security;

-- No access for anon. Signed-in users cannot set user_id: it defaults to auth.uid().
revoke all on public.trips from anon;
revoke all on public.trips from authenticated;
grant select, delete on public.trips to authenticated;
grant insert (title, destination_slug, start_date, end_date, notes) on public.trips to authenticated;
grant update (title, destination_slug, start_date, end_date, notes) on public.trips to authenticated;

drop policy if exists "Users can read own trips" on public.trips;
create policy "Users can read own trips"
  on public.trips for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create own trips" on public.trips;
create policy "Users can create own trips"
  on public.trips for insert
  to authenticated
  with check ((select auth.uid()) = user_id and user_id = auth.uid());

drop policy if exists "Users can update own trips" on public.trips;
create policy "Users can update own trips"
  on public.trips for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id and user_id = auth.uid());

drop policy if exists "Users can delete own trips" on public.trips;
create policy "Users can delete own trips"
  on public.trips for delete
  to authenticated
  using ((select auth.uid()) = user_id);
