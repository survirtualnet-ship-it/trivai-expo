-- Allow reading own activity + accepted friends' activity (for Actividades tab).
-- Safe to re-run.

alter table public.user_activity enable row level security;

drop policy if exists "user_activity_select_own" on public.user_activity;
drop policy if exists "user_activity_select_own_or_friends" on public.user_activity;

create policy "user_activity_select_own_or_friends"
  on public.user_activity for select
  using (
    auth.uid() = user_id
    or exists (
      select 1
      from public.friendships f
      where f.status = 'accepted'
        and (
          (f.user_id = auth.uid() and f.friend_id = user_activity.user_id)
          or (f.friend_id = auth.uid() and f.user_id = user_activity.user_id)
        )
    )
  );

-- Keep insert-own
drop policy if exists "user_activity_insert_own" on public.user_activity;
create policy "user_activity_insert_own"
  on public.user_activity for insert
  with check (auth.uid() = user_id);
