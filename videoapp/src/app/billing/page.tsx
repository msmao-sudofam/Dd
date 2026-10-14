import { requireProfile } from "@/lib/auth";
import { db } from "@/lib/db";
import { isMockStripe } from "@/lib/env";
import { PricingCards } from "@/components/pricing-cards";
import { monthlyPlanById, subscribedPlan } from "@/lib/pricing";

export const metadata = { title: "Billing" };

const REASON: Record<string, string> = {
  purchase: "Credit pack",
  subscription: "Monthly credits",
  generation: "Generation",
  refund: "Refund (failed generation)",
  signup_bonus: "Welcome bonus",
  referral: "Referral reward",
  admin: "Adjustment",
};

export default async function BillingPage({ searchParams }: PageProps<"/billing">) {
  const profile = await requireProfile("/billing");
  const sp = await searchParams;
  const ledger = await db().listLedger(profile.id, 100);
  const plan = subscribedPlan(profile);
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  // ?change=<plan id>: the confirm step for a subscriber moving to another plan (set by the checkout route).
  const target = plan ? monthlyPlanById(one(sp.change)) : null;
  const change = target && plan && target.id !== plan.id ? { to: target, upgrade: target.priceUsd > plan.priceUsd } : null;
  const changed = monthlyPlanById(one(sp.changed));
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-black tracking-tight">Billing</h1>
      {sp.success && <p className="mt-4 rounded-xl bg-wash p-3 text-sm text-foreground" data-testid="purchase-success">Payment received — credits added.</p>}
      {sp.canceled && <p className="mt-4 text-sm text-muted">Checkout canceled.</p>}
      {changed && (
        <p className="mt-4 rounded-xl bg-wash p-3 text-sm text-foreground" data-testid="plan-changed">
          Your plan is now {changed.name}. Nothing was charged today: your next renewal is ${changed.priceUsd} for {changed.creditsPerCycle} credits.
        </p>
      )}
      {one(sp.error) === "change" ? (
        <p className="mt-4 text-sm text-danger">
          The plan change didn&apos;t go through and your plan is unchanged. Check your payment method under Manage subscription, then try again.
        </p>
      ) : (
        sp.error && <p className="mt-4 text-sm text-danger">Checkout couldn&apos;t start. Try again.</p>
      )}

      {change && (
        <div className="card mt-6 p-6" data-testid="plan-change-confirm">
          <h2 className="text-lg font-bold">
            {change.upgrade ? "Upgrade" : "Switch"} to {change.to.name}?
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            {change.upgrade
              ? `You'll be charged $${change.to.priceUsd} now and get ${change.to.creditsPerCycle} credits now. Your billing month restarts today and renews at $${change.to.priceUsd} a month. The time left on ${plan!.name} isn't refunded; the credits you already have stay.`
              : `Nothing is charged now. From your next renewal you'll pay $${change.to.priceUsd} a month for ${change.to.creditsPerCycle} credits. The credits you already have stay.`}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <form action="/api/billing/checkout" method="post">
              <input type="hidden" name="product" value={change.to.id} />
              <input type="hidden" name="confirm" value="1" />
              <button className="btn-primary" data-testid="confirm-plan-change">
                {change.upgrade ? `Pay $${change.to.priceUsd} and upgrade` : `Switch to ${change.to.name}`}
              </button>
            </form>
            <a href="/billing" className="btn-ghost">Keep {plan!.name}</a>
          </div>
        </div>
      )}

      <div className="card mt-6 flex flex-wrap items-center gap-6 p-6">
        <div>
          <div className="label">Balance</div>
          <div className="text-5xl font-black" data-testid="billing-balance">{profile.credits_balance}</div>
        </div>
        <div>
          <div className="label">Plan</div>
          <div className="text-xl font-bold capitalize" data-testid="billing-plan">{plan ? plan.name : profile.plan}</div>
          {plan && <div className="text-xs text-muted">${plan.priceUsd} a month · {plan.creditsPerCycle} credits each month</div>}
        </div>
        {profile.stripe_customer_id && !isMockStripe() && (
          <form action="/api/billing/portal" method="post" className="ml-auto">
            <button className="btn-ghost">Manage subscription & invoices</button>
          </form>
        )}
      </div>

      <h2 className="mt-10 mb-4 text-lg font-bold">{plan ? "Change plan or add a pack" : "Pick a plan or a pack"}</h2>
      {isMockStripe() && (
        <p className="mb-4 text-xs text-muted">Stripe isn&apos;t configured — purchases are simulated and credit instantly.</p>
      )}
      <PricingCards loggedIn subscription={plan?.id ?? null} />
      <p className="mt-3 text-xs text-muted">
        Credits don&apos;t expire. An upgrade is charged in full when you confirm it and restarts your billing month; a switch to a smaller plan applies from your next renewal.
        Unused credit packs can be refunded within 14 days; used credits are non-refundable. Failed generations are refunded automatically.
      </p>

      <h2 className="mt-10 mb-4 text-lg font-bold">History</h2>
      <div className="card overflow-hidden">
        <table className="w-full text-sm" data-testid="ledger">
          <thead className="bg-surface-2 text-left text-xs uppercase tracking-wide text-muted">
            <tr><th className="p-3">Date</th><th className="p-3">What</th><th className="p-3 text-right">Credits</th></tr>
          </thead>
          <tbody>
            {ledger.map((l) => (
              <tr key={l.id} className="border-t border-border" data-reason={l.reason}>
                <td className="p-3 text-muted">{new Date(l.created_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</td>
                <td className="p-3">{REASON[l.reason] ?? l.reason}</td>
                <td className={`p-3 text-right font-mono ${l.delta > 0 ? "text-foreground" : ""}`}>{l.delta > 0 ? `+${l.delta}` : l.delta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
