-- Monthly plan tiers: which plan a subscriber is on (product id from lib/pricing.ts MONTHLY_PLANS).
-- profiles.plan stays 'monthly' for any active subscription; a subscriber with a null value here
-- predates the tiers and is on the entry plan.
alter table public.profiles
  add column subscription_plan text
    check (subscription_plan in ('monthly', 'monthly-growth', 'monthly-studio'));
