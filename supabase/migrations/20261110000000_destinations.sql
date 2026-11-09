-- Destinations: public, read-only content. Managed in the Supabase dashboard (or the SQL editor).

create table if not exists public.destinations (
  slug text primary key,
  name text not null,
  country text not null,
  type text not null check (type in ('Mountains', 'Coast', 'City', 'Desert', 'Forest', 'Island')),
  kind text not null check (kind in ('popular', 'hidden')),
  budget text not null check (budget in ('Budget', 'Mid-range', 'Premium')),
  best_months smallint[] not null,
  lat double precision not null,
  lng double precision not null,
  elevation integer not null default 0,
  summary text not null,
  highlights text[] not null default '{}',
  image_url text,
  image_credit text,
  image_license text,
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  check (best_months <@ array[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]::smallint[]),
  check (lat between -90 and 90),
  check (lng between -180 and 180)
);

alter table public.destinations enable row level security;

-- Read-only for everyone. No insert/update/delete policies exist, so the API cannot change content;
-- edit rows in the Supabase dashboard instead (the dashboard role bypasses RLS).
revoke all on public.destinations from anon, authenticated;
grant select on public.destinations to anon, authenticated;

drop policy if exists "Anyone can read destinations" on public.destinations;
create policy "Anyone can read destinations"
  on public.destinations for select
  to anon, authenticated
  using (true);
