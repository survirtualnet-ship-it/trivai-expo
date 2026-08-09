-- Growth loop: reviews + business replies.
-- Safe to re-run (idempotent). Run in Supabase SQL editor.

-- Core reviews table (shared with web; create if missing)
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  text text,
  created_at timestamptz not null default now()
);

create index if not exists reviews_place_created_idx
  on public.reviews (place_id, created_at desc);

create index if not exists reviews_user_idx
  on public.reviews (user_id);

alter table public.reviews
  add column if not exists reported boolean not null default false,
  add column if not exists reports_count integer not null default 0,
  add column if not exists is_hidden boolean not null default false;

-- One business reply per review
create table if not exists public.review_responses (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null unique references public.reviews(id) on delete cascade,
  business_id uuid not null references public.places(id) on delete cascade,
  owner_id uuid references public.profiles(id) on delete set null,
  text text not null check (char_length(trim(text)) > 0),
  created_at timestamptz not null default now()
);

create index if not exists review_responses_business_idx
  on public.review_responses (business_id, created_at desc);

alter table public.reviews enable row level security;
alter table public.review_responses enable row level security;

-- Reviews: public read (non-hidden), auth insert/update own
drop policy if exists "reviews_public_read" on public.reviews;
create policy "reviews_public_read"
  on public.reviews for select
  using (coalesce(is_hidden, false) = false);

drop policy if exists "reviews_auth_insert" on public.reviews;
create policy "reviews_auth_insert"
  on public.reviews for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "reviews_auth_update_own" on public.reviews;
create policy "reviews_auth_update_own"
  on public.reviews for update
  to authenticated
  using (auth.uid() = user_id);

-- Responses: public read; only claimed owner can insert/update
drop policy if exists "review_responses_public_read" on public.review_responses;
create policy "review_responses_public_read"
  on public.review_responses for select
  using (true);

drop policy if exists "review_responses_owner_insert" on public.review_responses;
create policy "review_responses_owner_insert"
  on public.review_responses for insert
  to authenticated
  with check (
    auth.uid() = owner_id
    and exists (
      select 1 from public.trivai_business b
      where b.place_id = business_id
        and b.claimed = true
        and b.owner_id = auth.uid()
    )
  );

drop policy if exists "review_responses_owner_update" on public.review_responses;
create policy "review_responses_owner_update"
  on public.review_responses for update
  to authenticated
  using (auth.uid() = owner_id);

-- Refresh place aggregates after review activity
create or replace function public.refresh_place_rating(p_place_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  avg_rating numeric;
  cnt integer;
begin
  select coalesce(avg(rating), 0), count(*)
    into avg_rating, cnt
  from public.reviews
  where place_id = p_place_id
    and coalesce(is_hidden, false) = false;

  update public.places
  set
    rating_avg = round(avg_rating::numeric, 2),
    rating_count = cnt
  where id = p_place_id;
end;
$$;

revoke all on function public.refresh_place_rating(uuid) from public;
grant execute on function public.refresh_place_rating(uuid) to authenticated;
grant execute on function public.refresh_place_rating(uuid) to anon;

create or replace function public.trg_reviews_refresh_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.refresh_place_rating(coalesce(NEW.place_id, OLD.place_id));
  return coalesce(NEW, OLD);
end;
$$;

drop trigger if exists reviews_refresh_rating on public.reviews;
create trigger reviews_refresh_rating
  after insert or update or delete on public.reviews
  for each row execute function public.trg_reviews_refresh_rating();
