-- Primera instalación de user_activity (sin DROP → sin aviso destructivo en Supabase).
-- Usa este archivo si la tabla NO existe todavía.

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

create policy "user_activity_insert_own"
  on public.user_activity for insert
  with check (auth.uid() = user_id);

create policy "user_activity_select_own"
  on public.user_activity for select
  using (auth.uid() = user_id);
