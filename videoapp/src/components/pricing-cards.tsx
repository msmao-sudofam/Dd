import Link from "next/link";
import { CREDIT_PACKS, MONTHLY_PLAN } from "@/lib/pricing";

/** Credit packs + monthly plan. Logged-in users get checkout buttons; others go to signup. */
export function PricingCards({ loggedIn, currentPlan }: { loggedIn: boolean; currentPlan?: string }) {
  const cta = (product: string, label: string, primary = false) =>
    loggedIn ? (
      <form action="/api/billing/checkout" method="post" className="mt-auto pt-6">
        <input type="hidden" name="product" value={product} />
        <button className={`${primary ? "btn-primary" : "btn-ghost"} w-full`} data-testid={`buy-${product}`}>
          {label}
        </button>
      </form>
    ) : (
      <Link href="/signup?next=/billing" className={`${primary ? "btn-primary" : "btn-ghost"} mt-auto w-full`}>
        Start free
      </Link>
    );

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {CREDIT_PACKS.map((p, i) => (
        <div key={p.id} className={`card flex flex-col p-6 ${i === 1 ? "border-accent" : ""}`}>
          <div className="text-sm font-semibold text-muted">{p.name}</div>
          <div className="mt-2 text-4xl font-black">${p.priceUsd}</div>
          <div className="mt-1 text-sm">{p.credits} credits</div>
          <div className="mt-1 text-xs text-muted">≈ {Math.floor(p.credits / 24)} Fast clips · ${(p.priceUsd / p.credits).toFixed(3)}/credit</div>
          <p className="mt-3 text-sm text-muted">{p.blurb}</p>
          {cta(p.id, `Buy ${p.name}`, i === 1)}
        </div>
      ))}
      <div className="card flex flex-col p-6">
        <div className="text-sm font-semibold text-muted">{MONTHLY_PLAN.name}</div>
        <div className="mt-2 text-4xl font-black">
          ${MONTHLY_PLAN.priceUsd}
          <span className="text-base font-medium text-muted">/mo</span>
        </div>
        <div className="mt-1 text-sm">{MONTHLY_PLAN.creditsPerCycle} credits every month</div>
        <div className="mt-1 text-xs text-muted">Cancel anytime · no watermark</div>
        <p className="mt-3 text-sm text-muted">{MONTHLY_PLAN.blurb}</p>
        {currentPlan === "monthly" ? (
          <div className="mt-auto pt-6 text-center text-sm text-accent">Current plan</div>
        ) : (
          cta("monthly", "Subscribe")
        )}
      </div>
    </div>
  );
}
