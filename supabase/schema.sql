-- Emergency Response — initial schema (Supabase / Postgres)
-- Apply with: supabase db push   (or paste into the SQL editor)

create extension if not exists postgis;

-- ── Profiles ────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  role text not null default 'individual'
    check (role in ('individual', 'responder', 'org_admin', 'coordinator', 'medic')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "own profile read" on public.profiles
  for select using (auth.uid() = id);
create policy "own profile write" on public.profiles
  for update using (auth.uid() = id);

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

create policy "own contacts" on public.emergency_contacts
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

create policy "members read org" on public.organizations
  for select using (
    exists (select 1 from public.memberships m
            where m.org_id = organizations.id and m.user_id = auth.uid())
  );

create policy "members read membership" on public.memberships
  for select using (user_id = auth.uid());

-- ── SOS events ──────────────────────────────────────────────
create table if not exists public.sos_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'active'
    check (status in ('active', 'cancelled', 'acknowledged', 'resolved')),
  location geography(point, 4326),
  note text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

alter table public.sos_events enable row level security;

create policy "own sos" on public.sos_events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists sos_events_location_idx on public.sos_events using gist (location);

-- ── Incidents ───────────────────────────────────────────────
create table if not exists public.incidents (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles (id) on delete set null,
  type text not null,
  severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
  description text not null,
  location geography(point, 4326),
  status text not null default 'reported'
    check (status in ('reported', 'triaged', 'assigned', 'resolved')),
  created_at timestamptz not null default now()
);

alter table public.incidents enable row level security;

create policy "signed-in can report" on public.incidents
  for insert with check (auth.uid() = reporter_id);
create policy "responders can read" on public.incidents
  for select using (
    exists (select 1 from public.profiles p
            where p.id = auth.uid()
              and p.role in ('responder', 'coordinator', 'medic', 'org_admin'))
  );
create policy "reporter reads own" on public.incidents
  for select using (reporter_id = auth.uid());

-- ── Nearby incidents helper ─────────────────────────────────
create or replace function public.incidents_near(
  lat double precision,
  lng double precision,
  radius_m integer default 5000
)
returns table (id uuid, type text, severity text, description text, status text, distance_m double precision)
language sql
security definer
set search_path = public
as $$
  select i.id, i.type, i.severity, i.description, i.status,
         st_distance(i.location, st_setsrid(st_makepoint(lng, lat), 4326)::geography) as distance_m
  from public.incidents i
  where i.location is not null
    and st_dwithin(i.location, st_setsrid(st_makepoint(lng, lat), 4326)::geography, radius_m)
  order by distance_m
  limit 50;
$$;
