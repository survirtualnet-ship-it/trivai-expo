-- Business analytics, products, gallery — Trivai Business infrastructure.
-- Safe to re-run (idempotent). Run in Supabase SQL editor.

-- ─── Business Events (append-only telemetry) ───────────────────────────────

create table if not exists public.business_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  business_id uuid not null references public.places(id) on delete cascade,
  google_place_id text,
  user_id uuid references public.profiles(id) on delete set null,
  anonymous_id text,
  event_type text not null,
  country text,
  city text,
  metadata jsonb not null default '{}'::jsonb,
  constraint business_events_type_check check (char_length(trim(event_type)) > 0),
  constraint business_events_actor_check check (
    user_id is not null or anonymous_id is not null
  )
);

create index if not exists business_events_business_created_idx
  on public.business_events (business_id, created_at desc);

create index if not exists business_events_type_created_idx
  on public.business_events (business_id, event_type, created_at desc);

create index if not exists business_events_google_place_idx
  on public.business_events (google_place_id, created_at desc)
  where google_place_id is not null;

alter table public.business_events enable row level security;

-- Tourists (anon + auth) can insert events — no PII required beyond optional user_id
drop policy if exists "business_events_insert" on public.business_events;
create policy "business_events_insert"
  on public.business_events for insert
  to anon, authenticated
  with check (
    business_id is not null
    and event_type is not null
    and (user_id is null or user_id = auth.uid())
  );

-- Claimed owners read events for their businesses only
drop policy if exists "business_events_owner_read" on public.business_events;
create policy "business_events_owner_read"
  on public.business_events for select
  to authenticated
  using (
    exists (
      select 1 from public.trivai_business b
      where b.place_id = business_id
        and b.claimed = true
        and b.owner_id = auth.uid()
    )
  );

-- ─── Daily aggregates (optional cache; populated by app/cron) ──────────────

create table if not exists public.business_metrics_daily (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.places(id) on delete cascade,
  metric_date date not null,
  event_type text not null,
  event_count integer not null default 0,
  unique (business_id, metric_date, event_type)
);

create index if not exists business_metrics_daily_lookup_idx
  on public.business_metrics_daily (business_id, metric_date desc);

alter table public.business_metrics_daily enable row level security;

drop policy if exists "business_metrics_daily_owner_read" on public.business_metrics_daily;
create policy "business_metrics_daily_owner_read"
  on public.business_metrics_daily for select
  to authenticated
  using (
    exists (
      select 1 from public.trivai_business b
      where b.place_id = business_id
        and b.claimed = true
        and b.owner_id = auth.uid()
    )
  );

-- ─── Business products (Trivai enrichment — not Google catalog) ─────────────

create table if not exists public.business_products (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places(id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  description text,
  price numeric(10, 2) not null default 0,
  image_url text,
  category text,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists business_products_place_idx
  on public.business_products (place_id, sort_order)
  where is_active = true;

alter table public.business_products enable row level security;

drop policy if exists "business_products_public_read" on public.business_products;
create policy "business_products_public_read"
  on public.business_products for select
  using (is_active = true);

drop policy if exists "business_products_owner_write" on public.business_products;
create policy "business_products_owner_write"
  on public.business_products for all
  to authenticated
  using (
    exists (
      select 1 from public.trivai_business b
      where b.place_id = place_id
        and b.claimed = true
        and b.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.trivai_business b
      where b.place_id = place_id
        and b.claimed = true
        and b.owner_id = auth.uid()
    )
  );

-- ─── Business gallery (Trivai-uploaded images) ─────────────────────────────

create table if not exists public.business_gallery (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places(id) on delete cascade,
  image_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists business_gallery_place_idx
  on public.business_gallery (place_id, sort_order);

alter table public.business_gallery enable row level security;

drop policy if exists "business_gallery_public_read" on public.business_gallery;
create policy "business_gallery_public_read"
  on public.business_gallery for select
  using (true);

drop policy if exists "business_gallery_owner_write" on public.business_gallery;
create policy "business_gallery_owner_write"
  on public.business_gallery for all
  to authenticated
  using (
    exists (
      select 1 from public.trivai_business b
      where b.place_id = place_id
        and b.claimed = true
        and b.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.trivai_business b
      where b.place_id = place_id
        and b.claimed = true
        and b.owner_id = auth.uid()
    )
  );

-- ─── RPC: aggregate events for dashboard (owner-only via RLS on underlying read) ─

create or replace function public.aggregate_business_events(
  p_business_id uuid,
  p_from timestamptz,
  p_to timestamptz
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  result jsonb;
begin
  select coalesce(
    jsonb_object_agg(event_type, cnt),
    '{}'::jsonb
  )
  into result
  from (
    select event_type, count(*)::bigint as cnt
    from public.business_events
    where business_id = p_business_id
      and created_at >= p_from
      and created_at < p_to
    group by event_type
  ) s;

  return result;
end;
$$;

grant execute on function public.aggregate_business_events(uuid, timestamptz, timestamptz)
  to authenticated;

-- Daily breakdown for charts (last N days)
create or replace function public.business_events_daily_series(
  p_business_id uuid,
  p_from date,
  p_to date,
  p_event_types text[] default null
)
returns table (metric_date date, event_type text, event_count bigint)
language sql
stable
security invoker
set search_path = public
as $$
  select
    (created_at at time zone 'utc')::date as metric_date,
    event_type,
    count(*)::bigint as event_count
  from public.business_events
  where business_id = p_business_id
    and (created_at at time zone 'utc')::date >= p_from
    and (created_at at time zone 'utc')::date <= p_to
    and (p_event_types is null or event_type = any(p_event_types))
  group by 1, 2
  order by 1, 2;
$$;

grant execute on function public.business_events_daily_series(uuid, date, date, text[])
  to authenticated;

-- Recent activity feed for business home
create or replace function public.business_recent_events(
  p_business_id uuid,
  p_limit integer default 10
)
returns table (
  id uuid,
  event_type text,
  created_at timestamptz,
  metadata jsonb
)
language sql
stable
security invoker
set search_path = public
as $$
  select id, event_type, created_at, metadata
  from public.business_events
  where business_id = p_business_id
  order by created_at desc
  limit greatest(p_limit, 1);
$$;

grant execute on function public.business_recent_events(uuid, integer)
  to authenticated;
