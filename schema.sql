-- DoG RaceHub v2.0 – central database
-- Run this once in Supabase SQL Editor. It creates ONE central state row.

create table if not exists public.app_state (
  id integer primary key default 1 check (id = 1),
  owner_id uuid not null references auth.users(id),
  updated_at timestamptz not null default now(),
  data jsonb not null default '{}'::jsonb
);

alter table public.app_state enable row level security;

drop policy if exists "RaceHub public read" on public.app_state;
create policy "RaceHub public read" on public.app_state
  for select using (true);

drop policy if exists "RaceHub first owner insert" on public.app_state;
create policy "RaceHub first owner insert" on public.app_state
  for insert with check (auth.uid() = owner_id and not exists (select 1 from public.app_state));

drop policy if exists "RaceHub owner update" on public.app_state;
create policy "RaceHub owner update" on public.app_state
  for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- No DELETE policy: the central database row cannot be deleted from the app.

-- Enable realtime updates so every phone/PC sees the same changes immediately.
alter table public.app_state replica identity full;
alter publication supabase_realtime add table public.app_state;
