import Link from "next/link";
import { CREDIT_PACKS, MONTHLY_PLAN } from "@/lib/pricing";

/** Credits for one Fast clip; used only for the "≈ N clips" hint. */
const FAST_CLIP_CREDITS = 24;

/** What every paid option includes. Each line is backed by the Terms (legal.ts) and the watermark rule (generation.ts). */
const PACK_INCLUDES = ["Credits don't expire", "No watermark", "Commercial use"];
const MONTHLY_INCLUDES = ["Credits added every month", "No watermark", "Commercial use", "Cancel anytime"];

const perCredit = (usd: number, credits: number) => usd / credits;
const MONTHLY_PER_CREDIT = perCredit(MONTHLY_PLAN.priceUsd, MONTHLY_PLAN.creditsPerCycle);
/** Only claimed while it is true of the numbers in lib/pricing.ts. */
const MONTHLY_IS_CHEAPEST = CREDIT_PACKS.every((p) => MONTHLY_PER_CREDIT <= perCredit(p.priceUsd, p.credits));

function Check() {
  return (
    <svg viewBox="0 0 16 16" className="mt-[3px] h-3.5 w-3.5 shrink-0 fill-none stroke-white/60 stroke-[1.75] [stroke-linecap:round] [stroke-linejoin:round]" aria-hidden>
      <path d="m3.5 8.5 3 3 6-7" />
    </svg>
  );
}

/**
 * The monthly plan first and highlighted (subscriptions are the business goal), then the one-off credit packs
 * (Epidemic Sound / JetBrains pattern: price, one line of scale, a short included list, one highlighted option).
 * Logged-in users get checkout buttons; others go to signup.
 */
export function PricingCards({ loggedIn, currentPlan }: { loggedIn: boolean; currentPlan?: string }) {
  const cta = (product: string, label: string, primary = false) =>
    loggedIn ? (
      <form action="/api/billing/checkout" method="post" className="mt-auto pt-7">
        <input type="hidden" name="product" value={product} />
        <button className={`${primary ? "btn-primary btn-sheen" : "btn-ghost"} w-full !py-2.5`} data-testid={`buy-${product}`}>
          {label}
        </button>
      </form>
    ) : (
      <div className="mt-auto pt-7">
        <Link href="/signup?next=/billing" className={`${primary ? "btn-primary btn-sheen" : "btn-ghost"} w-full !py-2.5`}>
          Start free
        </Link>
      </div>
    );

  const includes = (items: string[]) => (
    <ul className="mt-5 space-y-2 border-t border-border pt-5 text-sm text-soft/90">
      {items.map((t) => (
        <li key={t} className="flex gap-2.5">
          <Check />
          {t}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" data-testid="pricing-cards">
      <div
        className="spot flex flex-col rounded-[20px] border border-white/25 bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0.025))] p-6"
        data-testid="plan-monthly"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold">{MONTHLY_PLAN.name}</div>
          {MONTHLY_IS_CHEAPEST && <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-black">Lowest price per credit</span>}
        </div>
        <div className="mt-0.5 text-xs text-muted">{MONTHLY_PLAN.blurb}</div>
        <div className="display mt-5 text-[56px] tabular-nums">
          ${MONTHLY_PLAN.priceUsd}
          <span className="ml-1 text-base font-medium tracking-normal text-muted">/mo</span>
        </div>
        <div className="mt-2 text-sm">
          {MONTHLY_PLAN.creditsPerCycle} credits/mo <span className="text-muted">· ≈ {Math.floor(MONTHLY_PLAN.creditsPerCycle / FAST_CLIP_CREDITS)} Fast clips</span>
        </div>
        <div className="mt-0.5 text-xs text-subtle tabular-nums">${MONTHLY_PER_CREDIT.toFixed(3)} per credit</div>
        {includes(MONTHLY_INCLUDES)}
        {currentPlan === "monthly" ? (
          <div className="mt-auto pt-7 text-center text-sm text-muted">Current plan</div>
        ) : (
          cta("monthly", "Subscribe", true)
        )}
      </div>
      {CREDIT_PACKS.map((p) => (
        <div key={p.id} className="spot flex flex-col rounded-[20px] border border-border bg-wash p-6">
          <div className="text-sm font-semibold">
            {p.name} <span className="font-normal text-muted">· one-off pack</span>
          </div>
          <div className="mt-0.5 text-xs text-muted">{p.blurb}</div>
          <div className="display mt-5 text-[56px] tabular-nums">${p.priceUsd}</div>
          <div className="mt-2 text-sm">
            {p.credits} credits <span className="text-muted">· ≈ {Math.floor(p.credits / FAST_CLIP_CREDITS)} Fast clips</span>
          </div>
          <div className="mt-0.5 text-xs text-subtle tabular-nums">${perCredit(p.priceUsd, p.credits).toFixed(3)} per credit</div>
          {includes(PACK_INCLUDES)}
          {cta(p.id, `Buy ${p.name}`)}
        </div>
      ))}
    </div>
  );
}
