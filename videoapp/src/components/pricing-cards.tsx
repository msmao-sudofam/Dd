import Link from "next/link";
import { CREDIT_PACKS, MONTHLY_PLAN, MONTHLY_PLANS, perCreditUsd, type MonthlyPlan } from "@/lib/pricing";
import { Roll } from "./roll";

/** Credits for one Fast clip; used only for the "≈ N clips" hint. */
const FAST_CLIP_CREDITS = 24;

/** What every paid option includes. Each line is backed by the Terms (legal.ts) and the watermark rule (generation.ts). */
const PACK_INCLUDES = ["Credits don't expire", "No watermark", "Commercial use"];
const PLAN_INCLUDES = ["Unused credits roll over", "No watermark", "Commercial use", "Change plan or cancel anytime"];

/** The plan the page leads with: the middle one, the only lime button. */
const FEATURED: MonthlyPlan["id"] = "monthly-growth";

/** Whole-percent saving per credit against the entry plan; 0 hides the tag, so it is only claimed while true. */
const savingPct = (plan: MonthlyPlan) => Math.round((1 - perCreditUsd(plan) / perCreditUsd(MONTHLY_PLAN)) * 100);

function Check() {
  return (
    <svg viewBox="0 0 16 16" className="mt-[3px] h-3.5 w-3.5 shrink-0 fill-none stroke-white/60 stroke-[1.75] [stroke-linecap:round] [stroke-linejoin:round]" aria-hidden>
      <path d="m3.5 8.5 3 3 6-7" />
    </svg>
  );
}

/**
 * The monthly plans first (subscriptions are the business goal), the middle one highlighted, then the one-off
 * credit packs as a quieter second row. Logged-in users get checkout buttons; others go to signup. A subscriber
 * (`subscription` = their plan id) sees their plan marked and the others as upgrade / switch.
 */
export function PricingCards({ loggedIn, subscription }: { loggedIn: boolean; subscription?: MonthlyPlan["id"] | null }) {
  const current = MONTHLY_PLANS.find((p) => p.id === subscription) ?? null;

  const cta = (product: string, label: string, primary = false) =>
    loggedIn ? (
      <form action="/api/billing/checkout" method="post" className="mt-auto pt-7">
        <input type="hidden" name="product" value={product} />
        <button className={`${primary ? "btn-primary btn-sheen" : "btn-ghost"} w-full !py-2.5`} data-testid={`buy-${product}`}>
          <Roll>{label}</Roll>
        </button>
      </form>
    ) : (
      <div className="mt-auto pt-7">
        <Link href="/signup?next=/billing" className={`${primary ? "btn-primary btn-sheen" : "btn-ghost"} w-full !py-2.5`}>
          <Roll>Start free</Roll>
        </Link>
      </div>
    );

  const planLabel = (p: MonthlyPlan) => {
    if (!current) return "Subscribe";
    return p.priceUsd > current.priceUsd ? `Upgrade to ${p.name}` : `Switch to ${p.name}`;
  };

  return (
    <div data-testid="pricing-cards">
      <div className="grid gap-3 lg:grid-cols-3">
        {MONTHLY_PLANS.map((p) => {
          const featured = p.id === FEATURED;
          const saving = savingPct(p);
          return (
            <div
              key={p.id}
              className={`spot flex flex-col rounded-[20px] border p-6 ${
                featured ? "border-white/25 bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0.025))]" : "border-border bg-wash"
              }`}
              data-testid={`plan-${p.id}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold">
                  {p.name} <span className="font-normal text-muted">· monthly</span>
                </div>
                {saving > 0 && (
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${featured ? "border-transparent bg-white text-black" : "border-white/25 text-soft"}`}
                    data-testid={`saving-${p.id}`}
                  >
                    Save {saving}% per credit
                  </span>
                )}
              </div>
              <div className="mt-0.5 text-xs text-muted">{p.blurb}</div>
              <div className="display mt-5 text-[56px] tabular-nums">
                ${p.priceUsd}
                <span className="ml-1 text-base font-medium tracking-normal text-muted">/mo</span>
              </div>
              <div className="mt-2 text-sm">
                {p.creditsPerCycle.toLocaleString("en-US")} credits every month{" "}
                <span className="text-muted">· ≈ {Math.floor(p.creditsPerCycle / FAST_CLIP_CREDITS)} Fast clips</span>
              </div>
              <div className="mt-0.5 text-xs text-subtle tabular-nums">${perCreditUsd(p).toFixed(3)} per credit</div>
              <ul className="mt-5 space-y-2 border-t border-border pt-5 text-sm text-soft/90">
                {PLAN_INCLUDES.map((t) => (
                  <li key={t} className="flex gap-2.5">
                    <Check />
                    {t}
                  </li>
                ))}
              </ul>
              {current?.id === p.id ? (
                <div className="mt-auto pt-7 text-center text-sm text-muted" data-testid="current-plan">Your plan</div>
              ) : (
                cta(p.id, planLabel(p), featured)
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-10 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h3 className="text-sm font-semibold">One-off packs</h3>
        <p className="text-xs text-muted">No subscription. {PACK_INCLUDES.join(" · ")}.</p>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {CREDIT_PACKS.map((p) => (
          <div key={p.id} className="spot flex flex-col rounded-[20px] border border-border bg-wash p-6" data-testid={`pack-${p.id}`}>
            <div className="flex items-baseline justify-between gap-3">
              <div className="text-sm font-semibold">{p.name}</div>
              <div className="display text-[32px] tabular-nums">${p.priceUsd}</div>
            </div>
            <div className="mt-0.5 text-xs text-muted">{p.blurb}</div>
            <div className="mt-4 text-sm">
              {p.credits.toLocaleString("en-US")} credits <span className="text-muted">· ≈ {Math.floor(p.credits / FAST_CLIP_CREDITS)} Fast clips</span>
            </div>
            <div className="mt-0.5 text-xs text-subtle tabular-nums">${perCreditUsd(p).toFixed(3)} per credit</div>
            {cta(p.id, `Buy ${p.name}`)}
          </div>
        ))}
      </div>
    </div>
  );
}
