import "server-only";

/** Called once per newly-credited payment. Referral rewards are wired up in Phase 5. */
export async function onPurchaseCompleted(_userId: string, _paymentKey: string): Promise<void> {}
