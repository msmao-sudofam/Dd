-- Phase 1: core schema, RLS, atomic credit ledger, signup trigger.
--
-- Invariant: profiles.credits_balance changes ONLY through public.apply_credit_delta(),
-- which inserts a credit_ledger row and updates the balance in the same transaction.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text not null,
  credits_balance integer not null default 0 check (credits_balance >= 0),
  plan            text not null default 'free' check (plan in ('free', 'paid', 'monthly')),
  role            text not null default 'user' check (role in ('user', 'admin')),
  referral_code   text not null unique default substr(encode(gen_random_bytes(6), 'hex'), 1, 8),
  referred_by     uuid references public.profiles(id) on delete set null,
  created_at      timestamptz not null default now()
);

create table public.models (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  name              text not null,
  description       text not null default '',
  provider          text not null check (provider in ('fal', 'replicate', 'self', 'mock')),
  provider_model_id text not null,
  type              text not null check (type in ('t2v', 'i2v', 't2i', 'i2i')),
  tier              text not null default 'mid' check (tier in ('fast', 'mid', 'premium')),
  credit_cost       integer not null check (credit_cost > 0),     -- per generation at default duration
  credit_cost_per_second integer,                                  -- optional: duration-based pricing
  api_cost_usd      numeric(10, 4) not null default 0,             -- what one default generation costs us
  default_duration  integer,
  max_duration      integer,
  allowed_durations integer[] not null default '{}',
  allowed_aspects   text[] not null default '{9:16,16:9,1:1}',
  params_json       jsonb not null default '{}'::jsonb,            -- provider-specific extra params
  sort_order        integer not null default 100,
  enabled           boolean not null default true,
  created_at        timestamptz not null default now()
);

create table public.presets (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  name              text not null,
  description       text not null default '',
  thumbnail_url     text,
  preview_video_url text,
  model_id          uuid not null references public.models(id) on delete restrict,
  prompt_template   text not null,                                 -- may contain {subject}
  params_json       jsonb not null default '{}'::jsonb,            -- duration, aspect_ratio, etc.
  category          text not null check (category in ('camera-moves', 'product-ads', 'ugc', 'effects', 'viral')),
  requires_image    boolean not null default true,
  requires_subject  boolean not null default false,
  is_featured       boolean not null default false,
  sort_order        integer not null default 100,
  enabled           boolean not null default true,
  created_at        timestamptz not null default now()
);

create table public.jobs (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.profiles(id) on delete cascade,
  model_id            uuid not null references public.models(id),
  preset_id           uuid references public.presets(id) on delete set null,
  input_json          jsonb not null default '{}'::jsonb,
  status              text not null default 'queued'
                        check (status in ('queued', 'running', 'succeeded', 'failed', 'refunded')),
  provider            text not null,
  provider_request_id text,
  output_url          text,
  output_type         text not null default 'video' check (output_type in ('video', 'image')),
  credits_charged     integer not null default 0,
  cost_usd            numeric(10, 4) not null default 0,
  error               text,
  created_at          timestamptz not null default now(),
  completed_at        timestamptz
);
create index jobs_user_created_idx on public.jobs (user_id, created_at desc);
create unique index jobs_provider_request_idx on public.jobs (provider, provider_request_id)
  where provider_request_id is not null;

create table public.credit_ledger (
  id              bigserial primary key,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  delta           integer not null check (delta <> 0),
  reason          text not null
                    check (reason in ('purchase', 'generation', 'refund', 'signup_bonus', 'referral', 'subscription', 'admin')),
  job_id          uuid references public.jobs(id) on delete set null,
  stripe_event_id text unique,
  meta            jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now()
);
create index credit_ledger_user_idx on public.credit_ledger (user_id, created_at desc);
-- One debit and at most one refund per job.
create unique index credit_ledger_job_reason_idx on public.credit_ledger (job_id, reason)
  where job_id is not null;
-- One signup bonus per user, ever.
create unique index credit_ledger_signup_bonus_idx on public.credit_ledger (user_id)
  where reason = 'signup_bonus';

-- ---------------------------------------------------------------------------
-- Atomic credit movement
-- ---------------------------------------------------------------------------

-- Returns the balance after the call. Idempotent: if the ledger row would duplicate an
-- existing one (same stripe_event_id, same job+reason, second signup bonus) nothing
-- changes and the current balance is returned with applied = false.
create or replace function public.apply_credit_delta(
  p_user_id         uuid,
  p_delta           integer,
  p_reason          text,
  p_job_id          uuid default null,
  p_stripe_event_id text default null,
  p_meta            jsonb default '{}'::jsonb
) returns table (applied boolean, balance integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ledger_id bigint;
  v_balance   integer;
begin
  -- Lock the profile row so concurrent debits serialize.
  perform 1 from public.profiles where id = p_user_id for update;
  if not found then
    raise exception 'profile_not_found' using errcode = 'P0002';
  end if;

  insert into public.credit_ledger (user_id, delta, reason, job_id, stripe_event_id, meta)
  values (p_user_id, p_delta, p_reason, p_job_id, p_stripe_event_id, coalesce(p_meta, '{}'::jsonb))
  on conflict do nothing
  returning id into v_ledger_id;

  if v_ledger_id is null then
    select credits_balance into v_balance from public.profiles where id = p_user_id;
    return query select false, v_balance;
    return;
  end if;

  update public.profiles
     set credits_balance = credits_balance + p_delta
   where id = p_user_id
     and credits_balance + p_delta >= 0
  returning credits_balance into v_balance;

  if v_balance is null then
    raise exception 'insufficient_credits' using errcode = 'P0001';
  end if;

  return query select true, v_balance;
end;
$$;

revoke all on function public.apply_credit_delta(uuid, integer, text, uuid, text, jsonb) from public;
revoke all on function public.apply_credit_delta(uuid, integer, text, uuid, text, jsonb) from anon, authenticated;
grant execute on function public.apply_credit_delta(uuid, integer, text, uuid, text, jsonb) to service_role;

-- ---------------------------------------------------------------------------
-- Signup trigger: profile + small signup bonus (~1 cheap generation)
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email) values (new.id, coalesce(new.email, ''));
  perform public.apply_credit_delta(new.id, 24, 'signup_bonus'); -- keep = SIGNUP_BONUS_CREDITS
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row level security: users only read their own rows; all writes go through the server
-- (service role) so balances can never be edited from the client.
-- ---------------------------------------------------------------------------

alter table public.profiles      enable row level security;
alter table public.credit_ledger enable row level security;
alter table public.models        enable row level security;
alter table public.presets       enable row level security;
alter table public.jobs          enable row level security;

create policy "profiles: read own" on public.profiles
  for select to authenticated using (id = (select auth.uid()));

create policy "ledger: read own" on public.credit_ledger
  for select to authenticated using (user_id = (select auth.uid()));

create policy "jobs: read own" on public.jobs
  for select to authenticated using (user_id = (select auth.uid()));

create policy "models: read enabled" on public.models
  for select to anon, authenticated using (enabled);

create policy "presets: read enabled" on public.presets
  for select to anon, authenticated using (enabled);

revoke insert, update, delete on public.profiles, public.credit_ledger, public.jobs, public.models, public.presets
  from anon, authenticated;

-- Live job status for the generate page.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.jobs;
  end if;
end $$;
