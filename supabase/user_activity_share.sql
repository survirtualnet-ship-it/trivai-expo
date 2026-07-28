-- user_activity: crea la tabla completa (view, like, save, share).
-- Ejecuta ESTE archivo en Supabase SQL Editor si la tabla no existe.
-- Seguro de re-ejecutar: usa IF NOT EXISTS / DROP POLICY IF EXISTS.

create table if not exists public.user_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  place_id uuid not null references public.places(id) on delete cascade,
  action text not null check (action in ('view', 'like', 'save', 'share')),
  created_at timestamptz not null default now()
);

create index if not exists user_activity_user_created_idx
  on public.user_activity (user_id, created_at desc);

create index if not exists user_activity_place_idx
  on public.user_activity (place_id);

alter table public.user_activity enable row level security;

drop policy if exists "user_activity_insert_own" on public.user_activity;
create policy "user_activity_insert_own"
  on public.user_activity for insert
  with check (auth.uid() = user_id);

drop policy if exists "user_activity_select_own" on public.user_activity;
create policy "user_activity_select_own"
  on public.user_activity for select
  using (auth.uid() = user_id);

-- Si la tabla ya existía sin 'share', actualiza el check constraint:
alter table public.user_activity
  drop constraint if exists user_activity_action_check;

alter table public.user_activity
  add constraint user_activity_action_check
  check (action in ('view', 'like', 'save', 'share'));
