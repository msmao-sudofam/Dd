-- Phase 3: Stripe linkage + processed-event audit log.
alter table public.profiles
  add column stripe_customer_id     text unique,
  add column stripe_subscription_id text;

-- Every Stripe webhook we've processed (audit + fast duplicate short-circuit).
-- Credit idempotency itself is enforced by credit_ledger.stripe_event_id (unique), which stores a
-- per-payment key (checkout session id / invoice id) so two different events for the same payment
-- (e.g. checkout.session.completed + async_payment_succeeded) can't double-credit either.
create table public.stripe_events (
  id          text primary key,           -- evt_...
  type        text not null,
  received_at timestamptz not null default now()
);
alter table public.stripe_events enable row level security;
revoke all on public.stripe_events from anon, authenticated;
