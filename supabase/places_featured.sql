-- Featured places for discover feed (editorial highlight, not ads).
-- Run in Supabase SQL Editor once.

alter table public.places
  add column if not exists is_featured boolean not null default false;

comment on column public.places.is_featured is
  'Editorial highlight in discover feed; slight ranking boost + Recommended badge.';

create index if not exists places_is_featured_idx
  on public.places (is_featured)
  where is_featured = true;
