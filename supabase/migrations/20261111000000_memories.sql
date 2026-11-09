-- Memories: private notes and photos, saved per user.
-- Run after the trips migration (memories can link to a trip).

create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  trip_id uuid references public.trips (id) on delete set null,
  title text not null check (char_length(title) between 1 and 120),
  note text not null default '' check (char_length(note) <= 2000),
  photo_path text,
  taken_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- A photo must live in the owner's own folder of the memory-photos bucket: {user_id}/{file}
  check (photo_path is null or (char_length(photo_path) <= 300 and photo_path like user_id::text || '/%'))
);

create index if not exists memories_user_id_created_at_idx on public.memories (user_id, created_at desc);

-- Same helper as the trips migration (safe to redefine).
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

drop trigger if exists memories_set_updated_at on public.memories;
create trigger memories_set_updated_at
  before update on public.memories
  for each row execute function public.set_updated_at();

-- A linked trip must belong to the same user. Runs as the caller, so RLS on trips also applies:
-- another user's trip is not even visible, and the insert/update is rejected.
create or replace function public.memories_check_trip_owner()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.trip_id is not null and not exists (
    select 1 from public.trips t where t.id = new.trip_id and t.user_id = new.user_id
  ) then
    raise exception 'trip_id must reference one of your own trips' using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists memories_check_trip_owner on public.memories;
create trigger memories_check_trip_owner
  before insert or update of trip_id, user_id on public.memories
  for each row execute function public.memories_check_trip_owner();

alter table public.memories enable row level security;

-- No anon access. Signed-in users cannot set user_id (it defaults to auth.uid()).
revoke all on public.memories from anon;
revoke all on public.memories from authenticated;
grant select, delete on public.memories to authenticated;
grant insert (trip_id, title, note, photo_path, taken_on) on public.memories to authenticated;
grant update (trip_id, title, note, photo_path, taken_on) on public.memories to authenticated;

drop policy if exists "Users can read own memories" on public.memories;
create policy "Users can read own memories"
  on public.memories for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create own memories" on public.memories;
create policy "Users can create own memories"
  on public.memories for insert
  to authenticated
  with check ((select auth.uid()) = user_id and user_id = auth.uid());

drop policy if exists "Users can update own memories" on public.memories;
create policy "Users can update own memories"
  on public.memories for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id and user_id = auth.uid());

drop policy if exists "Users can delete own memories" on public.memories;
create policy "Users can delete own memories"
  on public.memories for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- Storage: private bucket for photos. Objects are named {user_id}/{uuid}.{ext}.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('memory-photos', 'memory-photos', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users can read own memory photos" on storage.objects;
create policy "Users can read own memory photos"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'memory-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Users can upload own memory photos" on storage.objects;
create policy "Users can upload own memory photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'memory-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Users can update own memory photos" on storage.objects;
create policy "Users can update own memory photos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'memory-photos' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'memory-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Users can delete own memory photos" on storage.objects;
create policy "Users can delete own memory photos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'memory-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
