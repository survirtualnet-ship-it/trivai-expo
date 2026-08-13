-- Business lifecycle columns on trivai_business (multi-owner, subscription-ready).
-- Safe to re-run. Apply after hybrid-places.sql.

-- Drop check constraints before (re)creating with widened allowed values
alter table public.trivai_business drop constraint if exists trivai_business_claim_status_check;
alter table public.trivai_business drop constraint if exists trivai_business_subscription_plan_check;
alter table public.trivai_business drop constraint if exists trivai_business_subscription_status_check;
alter table public.trivai_business drop constraint if exists trivai_business_verification_status_check;

alter table public.trivai_business
  add column if not exists claim_status text not null default 'unclaimed';

alter table public.trivai_business
  add column if not exists subscription_plan text not null default 'FREE';

alter table public.trivai_business
  add column if not exists subscription_status text not null default 'none';

alter table public.trivai_business
  add column if not exists verification_status text not null default 'unverified';

alter table public.trivai_business
  add column if not exists claimed_at timestamptz;

alter table public.trivai_business
  add column if not exists subscription_started_at timestamptz;

alter table public.trivai_business
  add column if not exists subscription_expires_at timestamptz;

alter table public.trivai_business
  add column if not exists custom_logo_url text;

alter table public.trivai_business
  add constraint trivai_business_claim_status_check
    check (claim_status in ('unclaimed', 'claimed', 'identified'));

alter table public.trivai_business
  add constraint trivai_business_subscription_plan_check
    check (subscription_plan in ('FREE', 'PRO', 'PREMIUM'));

alter table public.trivai_business
  add constraint trivai_business_subscription_status_check
    check (subscription_status in (
      'none', 'free', 'pro', 'premium',
      'active', 'expired', 'cancelled'
    ));

alter table public.trivai_business
  add constraint trivai_business_verification_status_check
    check (verification_status in ('unverified', 'pending', 'verified'));

-- Backfill existing claimed rows (legacy active → map to tier via plan column)
update public.trivai_business
set
  claim_status = case
    when claimed = true and owner_id is not null then 'claimed'
    when claim_status = 'identified' then 'unclaimed'
    else coalesce(claim_status, 'unclaimed')
  end,
  subscription_plan = coalesce(subscription_plan, 'FREE'),
  subscription_status = case
    when subscription_status in ('free', 'pro', 'premium') then subscription_status
    when claimed = true and owner_id is not null and subscription_status = 'active' then
      case coalesce(subscription_plan, 'FREE')
        when 'PRO' then 'pro'
        when 'PREMIUM' then 'premium'
        else 'free'
      end
    when claimed = true and owner_id is not null then coalesce(subscription_status, 'none')
    else coalesce(subscription_status, 'none')
  end,
  verification_status = coalesce(verification_status, 'unverified'),
  claimed_at = case
    when claimed = true and owner_id is not null and claimed_at is null then now()
    else claimed_at
  end
where true;

create index if not exists trivai_business_owner_multi_idx
  on public.trivai_business (owner_id, claim_status)
  where owner_id is not null;

comment on column public.trivai_business.claim_status is
  'unclaimed = Google-only; claimed = has ownerUserId; identified = legacy alias of unclaimed';
comment on column public.trivai_business.subscription_status is
  'Tier: none | free | pro | premium. Legacy: active | expired | cancelled';
comment on column public.trivai_business.subscription_plan is
  'Legacy uppercase mirror of tier — billing not wired yet';
comment on column public.trivai_business.verification_status is
  'Prepared for future verified badge — no app logic yet';
comment on column public.trivai_business.claimed_at is
  'Timestamp when owner completed claim';
comment on column public.trivai_business.subscription_started_at is
  'When subscription tier was chosen (no billing yet)';
comment on column public.trivai_business.subscription_expires_at is
  'Future billing expiry — nullable until payments wired';
comment on column public.trivai_business.custom_logo_url is
  'PRO+ custom logo — overrides Google photo in app UI';

-- Optional: admin role on profiles for future BackOffice (never used in mobile nav)
alter table public.profiles drop constraint if exists profiles_app_role_check;
alter table public.profiles
  add column if not exists app_role text;

alter table public.profiles
  add constraint profiles_app_role_check
    check (app_role is null or app_role in ('tourist', 'business', 'admin'));

comment on column public.profiles.app_role is
  'Future explicit app role; today account_type personal|business remains source of truth';
