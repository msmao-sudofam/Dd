import { requireProfile } from "@/lib/auth";
import { db } from "@/lib/db";
import { isMockStripe } from "@/lib/env";
import { PricingCards } from "@/components/pricing-cards";

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
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-black tracking-tight">Billing</h1>
      {sp.success && <p className="mt-4 rounded-xl bg-accent/10 p-3 text-sm text-accent" data-testid="purchase-success">Payment received — credits added.</p>}
      {sp.canceled && <p className="mt-4 text-sm text-muted">Checkout canceled.</p>}
      {sp.error && <p className="mt-4 text-sm text-danger">Checkout couldn&apos;t start. Try again.</p>}

      <div className="card mt-6 flex flex-wrap items-center gap-6 p-6">
        <div>
          <div className="label">Balance</div>
          <div className="text-5xl font-black" data-testid="billing-balance">{profile.credits_balance}</div>
        </div>
        <div>
          <div className="label">Plan</div>
          <div className="text-xl font-bold capitalize">{profile.plan}</div>
        </div>
        {profile.stripe_customer_id && !isMockStripe() && (
          <form action="/api/billing/portal" method="post" className="ml-auto">
            <button className="btn-ghost">Manage subscription & invoices</button>
          </form>
        )}
      </div>

      <h2 className="mt-10 mb-4 text-lg font-bold">Buy credits</h2>
      {isMockStripe() && (
        <p className="mb-4 text-xs text-muted">Stripe isn&apos;t configured — purchases are simulated and credit instantly.</p>
      )}
      <PricingCards loggedIn currentPlan={profile.plan} />
      <p className="mt-3 text-xs text-muted">
        Credits don&apos;t expire. Unused credit packs can be refunded within 14 days; used credits are non-refundable. Failed generations are refunded automatically.
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
                <td className={`p-3 text-right font-mono ${l.delta > 0 ? "text-accent" : ""}`}>{l.delta > 0 ? `+${l.delta}` : l.delta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
