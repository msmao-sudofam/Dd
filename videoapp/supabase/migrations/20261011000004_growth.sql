-- Phase 5: abuse-resistant signup bonus, referrals.

-- The signup bonus is no longer granted by the trigger. The server grants it with
-- claim_signup_bonus() after checking the device/IP fingerprint (1 bonus per device).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email) values (new.id, coalesce(new.email, ''));
  return new;
end;
$$;

create table public.signup_fingerprints (
  user_id     uuid not null references public.profiles(id) on delete cascade,
  fingerprint text not null,           -- 'dev:<sha256>' or 'ip:<sha256>' (never raw IPs)
  created_at  timestamptz not null default now(),
  primary key (user_id, fingerprint)
);
create index signup_fingerprints_fp_idx on public.signup_fingerprints (fingerprint);
alter table public.signup_fingerprints enable row level security;
revoke all on public.signup_fingerprints from anon, authenticated;

-- Records the fingerprint for this user and returns how many OTHER accounts already used it.
create or replace function public.record_signup_fingerprint(p_user_id uuid, p_fingerprint text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prior integer;
begin
  perform pg_advisory_xact_lock(hashtext(p_fingerprint));
  select count(*) into v_prior from public.signup_fingerprints
   where fingerprint = p_fingerprint and user_id <> p_user_id;
  insert into public.signup_fingerprints (user_id, fingerprint) values (p_user_id, p_fingerprint)
  on conflict do nothing;
  return v_prior;
end;
$$;
revoke all on function public.record_signup_fingerprint(uuid, text) from public, anon, authenticated;
grant execute on function public.record_signup_fingerprint(uuid, text) to service_role;

-- Bonus amount lives in the app (SIGNUP_BONUS_CREDITS); the ledger's partial unique index
-- already guarantees at most one signup_bonus row per user.
