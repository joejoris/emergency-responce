-- Emergency Response — Supabase schema
-- Apply in the Supabase SQL editor (or `supabase db push`).
-- Safe to re-run: all statements are idempotent.

create extension if not exists pgcrypto;

-- ── Profiles ────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  role text not null default 'individual'
    check (role in ('individual', 'responder', 'org_admin', 'coordinator', 'medic')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "own profile read" on public.profiles;
create policy "own profile read" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "own profile write" on public.profiles;
create policy "own profile write" on public.profiles
  for update using (auth.uid() = id);

-- Auto-create a profile for every new auth user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Emergency contacts ──────────────────────────────────────
create table if not exists public.emergency_contacts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  relation text,
  phone text not null,
  created_at timestamptz not null default now()
);

alter table public.emergency_contacts enable row level security;

drop policy if exists "own contacts" on public.emergency_contacts;
create policy "own contacts" on public.emergency_contacts
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- ── Family / household check-in ─────────────────────────────
create table if not exists public.family_members (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  status text not null default 'unknown'
    check (status in ('unknown', 'safe', 'help')),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.family_members enable row level security;

drop policy if exists "own family" on public.family_members;
create policy "own family" on public.family_members
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- ── Organizations / members ─────────────────────────────────
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.memberships (
  org_id uuid references public.organizations (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete cascade,
  role text not null default 'member' check (role in ('member', 'admin')),
  primary key (org_id, user_id)
);

alter table public.organizations enable row level security;
alter table public.memberships enable row level security;

drop policy if exists "members read org" on public.organizations;
create policy "members read org" on public.organizations
  for select using (
    exists (select 1 from public.memberships m
            where m.org_id = organizations.id and m.user_id = auth.uid())
  );

drop policy if exists "members read membership" on public.memberships;
create policy "members read membership" on public.memberships
  for select using (user_id = auth.uid());

-- ── SOS events ──────────────────────────────────────────────
create table if not exists public.sos_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete cascade,
  status text not null default 'active'
    check (status in ('active', 'cancelled', 'acknowledged', 'resolved')),
  lat double precision,
  lng double precision,
  accuracy_m double precision,
  note text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

alter table public.sos_events enable row level security;

-- Signed-in users can manage their own events; anonymous SOS is allowed for
-- clients that are not signed in yet (user_id stays null).
drop policy if exists "own sos" on public.sos_events;
create policy "own sos" on public.sos_events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id or user_id is null);

create index if not exists sos_events_created_idx on public.sos_events (created_at desc);

-- ── Incidents ───────────────────────────────────────────────
create table if not exists public.incidents (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles (id) on delete set null,
  type text not null,
  severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
  description text not null,
  lat double precision,
  lng double precision,
  status text not null default 'reported'
    check (status in ('reported', 'triaged', 'assigned', 'resolved')),
  created_at timestamptz not null default now()
);

alter table public.incidents enable row level security;

drop policy if exists "anyone can report" on public.incidents;
create policy "anyone can report" on public.incidents
  for insert with check (reporter_id is null or reporter_id = auth.uid());

drop policy if exists "public read incidents" on public.incidents;
create policy "public read incidents" on public.incidents
  for select using (true);

create index if not exists incidents_created_idx on public.incidents (created_at desc);

-- ── Nearby incidents (distance in metres) ───────────────────
create or replace function public.incidents_near(
  p_lat double precision,
  p_lng double precision,
  radius_m integer default 5000
)
returns table (
  id uuid, type text, severity text, description text, status text,
  lat double precision, lng double precision, distance_m double precision
)
language sql
stable
security invoker
set search_path = public
as $$
  select i.id, i.type, i.severity, i.description, i.status, i.lat, i.lng,
         6371000 * 2 * asin(sqrt(
           power(sin(radians(i.lat - p_lat) / 2), 2) +
           cos(radians(p_lat)) * cos(radians(i.lat)) *
           power(sin(radians(i.lng - p_lng) / 2), 2)
         )) as distance_m
  from public.incidents i
  where i.lat is not null and i.lng is not null
    and 6371000 * 2 * asin(sqrt(
          power(sin(radians(i.lat - p_lat) / 2), 2) +
          cos(radians(p_lat)) * cos(radians(i.lat)) *
          power(sin(radians(i.lng - p_lng) / 2), 2)
        )) <= radius_m
  order by distance_m
  limit 50;
$$;
