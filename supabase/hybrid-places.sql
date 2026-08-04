-- Hybrid places model: Google base + Trivai enrichment only.
-- Run in Supabase SQL editor.

-- Link Supabase place UUID ↔ Google Place ID
alter table public.places
  add column if not exists google_place_id text unique;

create index if not exists places_google_place_id_idx
  on public.places (google_place_id)
  where google_place_id is not null;

-- Claim registry (who owns which place)
create table if not exists public.trivai_business (
  place_id uuid primary key references public.places(id) on delete cascade,
  google_place_id text not null unique,
  claimed boolean not null default false,
  owner_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists trivai_business_owner_idx
  on public.trivai_business (owner_id)
  where owner_id is not null;

-- Lightweight Google cache (TTL managed in app)
create table if not exists public.places_cache (
  google_place_id text primary key,
  name text not null,
  address text,
  latitude double precision,
  longitude double precision,
  rating_avg numeric(3,2),
  rating_count integer,
  photos jsonb default '[]'::jsonb,
  raw jsonb,
  last_fetched timestamptz not null default now()
);

-- Trivai-only dynamic content ("perfil vivo")
create table if not exists public.place_live_content (
  place_id uuid primary key references public.places(id) on delete cascade,
  best_time_tip text,
  crowd_level text check (crowd_level in ('low', 'medium', 'high')),
  crowd_updated_at timestamptz,
  tips jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- RLS: public read enrichment; owners write live content
alter table public.trivai_business enable row level security;
alter table public.places_cache enable row level security;
alter table public.place_live_content enable row level security;

create policy "trivai_business_public_read"
  on public.trivai_business for select using (true);

create policy "trivai_business_owner_claim"
  on public.trivai_business for insert
  with check (auth.uid() = owner_id);

create policy "trivai_business_owner_update"
  on public.trivai_business for update
  using (auth.uid() = owner_id);

create policy "places_cache_public_read"
  on public.places_cache for select using (true);

create policy "place_live_content_public_read"
  on public.place_live_content for select using (true);

create policy "place_live_content_owner_write"
  on public.place_live_content for all
  using (
    exists (
      select 1 from public.trivai_business b
      where b.place_id = place_live_content.place_id
        and b.owner_id = auth.uid()
        and b.claimed = true
    )
  );
