-- Legal MVP + UGC moderation. Run in Supabase SQL editor.

alter table public.profiles
  add column if not exists legal_accepted boolean not null default false,
  add column if not exists legal_accepted_at timestamptz,
  add column if not exists legal_version text;

comment on column public.profiles.legal_accepted is 'User accepted current Terms + Privacy';
comment on column public.profiles.legal_version is 'LEGAL_VERSION string accepted by user';

alter table public.reviews
  add column if not exists reported boolean not null default false,
  add column if not exists reports_count integer not null default 0,
  add column if not exists is_hidden boolean not null default false;

create index if not exists reviews_hidden_idx
  on public.reviews (place_id)
  where is_hidden = false;

-- Report UGC without letting reporters edit arbitrary review fields.
-- Threshold: hide when reports_count > 3
create or replace function public.report_review(p_review_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.reviews%rowtype;
  next_count integer;
  hide boolean;
begin
  if auth.uid() is null then
    return json_build_object('ok', false, 'error', 'not_authenticated');
  end if;

  select * into r from public.reviews where id = p_review_id for update;
  if not found then
    return json_build_object('ok', false, 'error', 'not_found');
  end if;

  if r.user_id = auth.uid() then
    return json_build_object('ok', false, 'error', 'cannot_report_own');
  end if;

  next_count := coalesce(r.reports_count, 0) + 1;
  hide := next_count > 3 or coalesce(r.is_hidden, false);

  update public.reviews
  set
    reported = true,
    reports_count = next_count,
    is_hidden = hide
  where id = p_review_id;

  return json_build_object(
    'ok', true,
    'reportsCount', next_count,
    'hidden', hide
  );
end;
$$;

revoke all on function public.report_review(uuid) from public;
grant execute on function public.report_review(uuid) to authenticated;
