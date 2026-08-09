-- P0: Harden places / cache RLS for claim + enrichment.
-- Safe to re-run. Apply in Supabase SQL editor AFTER relying on claim/reviews in prod.

-- ── places: only enrichment shells with a Google Place ID ──────────────
drop policy if exists "places_claim_insert" on public.places;
drop policy if exists "places_enrichment_insert" on public.places;
create policy "places_enrichment_insert"
  on public.places for insert
  to authenticated
  with check (
    google_place_id is not null
    and char_length(trim(google_place_id)) > 10
  );

-- Owners of claimed places can update; unclaimed enrichment shells
-- can be refreshed by any authenticated user (coords/photos sync).
drop policy if exists "places_owner_update" on public.places;
drop policy if exists "places_owner_or_unclaimed_update" on public.places;
create policy "places_owner_or_unclaimed_update"
  on public.places for update
  to authenticated
  using (
    exists (
      select 1 from public.trivai_business b
      where b.place_id = places.id
        and b.claimed = true
        and b.owner_id = auth.uid()
    )
    or not exists (
      select 1 from public.trivai_business b
      where b.place_id = places.id
        and b.claimed = true
    )
  )
  with check (true);

-- ── places_cache: authenticated write only (no anon) ─────────────────
drop policy if exists "places_cache_auth_upsert" on public.places_cache;
create policy "places_cache_auth_upsert"
  on public.places_cache for insert
  to authenticated
  with check (
    google_place_id is not null
    and char_length(trim(google_place_id)) > 10
    and name is not null
  );

drop policy if exists "places_cache_auth_update" on public.places_cache;
create policy "places_cache_auth_update"
  on public.places_cache for update
  to authenticated
  using (true)
  with check (
    google_place_id is not null
    and char_length(trim(google_place_id)) > 10
  );

-- Explicitly deny anon writes if older policies linger
drop policy if exists "places_cache_anon_write" on public.places_cache;
