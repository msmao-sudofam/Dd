import "server-only";
import { db } from "@/lib/db";
import { REFERRAL_BONUS_CREDITS } from "@/lib/pricing";

/**
 * Called once per newly-credited payment. On the referee's FIRST payment, both sides get
 * REFERRAL_BONUS_CREDITS (paying on purchase, not signup, so fake accounts can't farm it).
 * Idempotent: the ledger keys are unique per referee.
 */
export async function onPurchaseCompleted(userId: string, paymentKey: string): Promise<void> {
  const me = await db().getProfile(userId);
  if (!me?.referred_by) return;
  const paid = (await db().listLedger(userId, 1000)).filter((l) => l.reason === "purchase" || l.reason === "subscription");
  if (paid.length !== 1) return; // only the first payment counts
  const referrer = await db().getProfile(me.referred_by);
  if (!referrer) return;
  await db().applyCredit({
    userId: me.id,
    delta: REFERRAL_BONUS_CREDITS,
    reason: "referral",
    stripeEventId: `ref:referee:${me.id}`,
    meta: { referrer: referrer.id, payment: paymentKey },
  });
  await db().applyCredit({
    userId: referrer.id,
    delta: REFERRAL_BONUS_CREDITS,
    reason: "referral",
    stripeEventId: `ref:referrer:${me.id}`,
    meta: { referee: me.id, payment: paymentKey },
  });
}
