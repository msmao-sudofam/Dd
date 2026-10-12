import { getSessionUser } from "@/lib/auth";
import { PricingCards } from "@/components/pricing-cards";
import { db } from "@/lib/db";
import { MONTHLY_PLAN } from "@/lib/pricing";
import { modelAvailable } from "@/lib/providers";

export const metadata = {
  title: "Pricing",
  description: `A monthly plan with ${MONTHLY_PLAN.creditsPerCycle} credits for $${MONTHLY_PLAN.priceUsd}, or one-off credit packs. You see the cost before every generation.`,
};

export default async function PricingPage() {
  const [user, models] = await Promise.all([getSessionUser(), db().listModels()]);
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="text-4xl font-black tracking-tight">One monthly plan, or a pack when you need one</h1>
      <p className="mt-3 max-w-2xl text-muted">
        The monthly plan adds {MONTHLY_PLAN.creditsPerCycle} credits every month for ${MONTHLY_PLAN.priceUsd} and can be cancelled anytime. Packs are one-off and never expire.
        Spend credits on any preset or model: you always see the cost before you generate, and failed generations are refunded automatically.
      </p>
      <div className="mt-10"><PricingCards loggedIn={!!user} /></div>
      <h2 className="mt-14 mb-4 text-xl font-bold">What things cost</h2>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-2 text-left text-xs uppercase tracking-wide text-muted">
            <tr><th className="p-3">Model</th><th className="p-3">Type</th><th className="p-3 text-right">Credits</th></tr>
          </thead>
          <tbody>
            {models.filter((m) => m.type !== "ugc" && modelAvailable(m)).map((m) => (
              <tr key={m.slug} className="border-t border-border">
                <td className="p-3 font-medium">{m.name}</td>
                <td className="p-3 text-muted">{m.type === "t2i" ? "Image" : `${m.default_duration}s video`}</td>
                <td className="p-3 text-right">
                  {m.credit_cost}
                  {m.credit_cost_per_second ? <span className="text-muted"> ({m.credit_cost_per_second}/s)</span> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
