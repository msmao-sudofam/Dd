import { isMockBackend, isMockProvidersForced, isMockStripe } from "@/lib/env";

/** What is simulated on this deployment, if anything. Real backend only: local mock runs are obviously not live. */
export function demoMode(): { samples: boolean; payments: boolean } | null {
  if (isMockBackend()) return null;
  const samples = isMockProvidersForced();
  const payments = isMockStripe();
  return samples || payments ? { samples, payments } : null;
}

/**
 * A plain line above the header whenever a real deployment still runs on simulated generation or simulated
 * payments, so no visitor mistakes a sample clip for their own or thinks they were charged.
 * It disappears by itself once MOCK_PROVIDERS is off and a Stripe key is set.
 */
export function DemoBanner() {
  const demo = demoMode();
  if (!demo) return null;
  const parts = [
    demo.samples ? "generated clips are samples, not made from your photo" : null,
    demo.payments ? "payments are simulated and nothing is charged" : null,
  ].filter(Boolean);
  return (
    <>
      {/* The hero is sized to the first screen, so it needs this line's height before any script runs (<Fx/> then measures it). */}
      <style>{":root{--pre:44px}@media (min-width:768px){:root{--pre:28px}}"}</style>
      <p className="bg-white px-4 py-1.5 text-center text-xs font-medium text-black" role="status" data-testid="demo-banner" data-site-banner>
        Demo mode: {parts.join("; ")}.
      </p>
    </>
  );
}
