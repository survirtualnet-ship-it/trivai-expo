-- Business profile enrichment — Trivai-owned content (not Google catalog).
-- Safe to re-run (idempotent). Run after business-analytics.sql.

-- ─── Enrichment row (1:1 with places) ───────────────────────────────────────

create table if not exists public.business_enrichment (
  place_id uuid primary key references public.places(id) on delete cascade,
  whatsapp text,
  phone_secondary text,
  email_commercial text,
  services jsonb not null default '[]'::jsonb,
  languages text[] not null default '{}',
  payment_methods text[] not null default '{}',
  accessibility jsonb not null default '[]'::jsonb,
  amenities jsonb not null default '[]'::jsonb,
  hours jsonb,
  hours_complete boolean not null default false,
  temporarily_closed boolean not null default false,
  social_instagram text,
  social_facebook text,
  social_tiktok text,
  social_youtube text,
  social_linkedin text,
  social_x text,
  google_synced_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.business_enrichment enable row level security;

drop policy if exists "business_enrichment_public_read" on public.business_enrichment;
create policy "business_enrichment_public_read"
  on public.business_enrichment for select using (true);

drop policy if exists "business_enrichment_owner_write" on public.business_enrichment;
create policy "business_enrichment_owner_write"
  on public.business_enrichment for all
  to authenticated
  using (
    exists (
      select 1 from public.trivai_business b
      where b.place_id = business_enrichment.place_id
        and b.claimed = true and b.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.trivai_business b
      where b.place_id = business_enrichment.place_id
        and b.claimed = true and b.owner_id = auth.uid()
    )
  );

-- Extend products (align with Sprint 4 field names)
alter table public.business_products
  add column if not exists currency text not null default 'BOB',
  add column if not exists status text not null default 'published';

-- Extend gallery
alter table public.business_gallery
  add column if not exists is_cover boolean not null default false,
  add column if not exists media_type text not null default 'image',
  add column if not exists updated_at timestamptz not null default now();

-- ─── Menu (restaurants) ─────────────────────────────────────────────────────

create table if not exists public.business_menu (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places(id) on delete cascade,
  title text not null default 'Menú',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists business_menu_place_active_idx
  on public.business_menu (place_id)
  where is_active = true;

create table if not exists public.business_menu_sections (
  id uuid primary key default gen_random_uuid(),
  menu_id uuid not null references public.business_menu(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.business_menu_items (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.business_menu_sections(id) on delete cascade,
  name text not null,
  description text,
  price numeric(10, 2) not null default 0,
  currency text not null default 'BOB',
  image_url text,
  sort_order integer not null default 0,
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.business_menu enable row level security;
alter table public.business_menu_sections enable row level security;
alter table public.business_menu_items enable row level security;

drop policy if exists "business_menu_public_read" on public.business_menu;
create policy "business_menu_public_read"
  on public.business_menu for select using (is_active = true);

drop policy if exists "business_menu_owner_write" on public.business_menu;
create policy "business_menu_owner_write"
  on public.business_menu for all to authenticated
  using (
    exists (
      select 1 from public.trivai_business b
      where b.place_id = place_id and b.claimed = true and b.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.trivai_business b
      where b.place_id = place_id and b.claimed = true and b.owner_id = auth.uid()
    )
  );

drop policy if exists "business_menu_sections_owner" on public.business_menu_sections;
create policy "business_menu_sections_owner"
  on public.business_menu_sections for all to authenticated
  using (
    exists (
      select 1 from public.business_menu m
      join public.trivai_business b on b.place_id = m.place_id
      where m.id = menu_id and b.claimed = true and b.owner_id = auth.uid()
    )
  );

drop policy if exists "business_menu_items_public_read" on public.business_menu_items;
create policy "business_menu_items_public_read"
  on public.business_menu_items for select using (
    exists (
      select 1 from public.business_menu_sections s
      join public.business_menu m on m.id = s.menu_id
      where s.id = section_id and m.is_active = true
    )
  );

drop policy if exists "business_menu_items_owner_write" on public.business_menu_items;
create policy "business_menu_items_owner_write"
  on public.business_menu_items for all to authenticated
  using (
    exists (
      select 1 from public.business_menu_sections s
      join public.business_menu m on m.id = s.menu_id
      join public.trivai_business b on b.place_id = m.place_id
      where s.id = section_id and b.claimed = true and b.owner_id = auth.uid()
    )
  );

-- Opportunity completion tracking (optional persistence)
create table if not exists public.business_opportunity_dismissals (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places(id) on delete cascade,
  opportunity_id text not null,
  dismissed_at timestamptz not null default now(),
  unique (place_id, opportunity_id)
);

alter table public.business_opportunity_dismissals enable row level security;

drop policy if exists "business_opportunity_dismissals_owner" on public.business_opportunity_dismissals;
create policy "business_opportunity_dismissals_owner"
  on public.business_opportunity_dismissals for all to authenticated
  using (
    exists (
      select 1 from public.trivai_business b
      where b.place_id = place_id and b.claimed = true and b.owner_id = auth.uid()
    )
  );
