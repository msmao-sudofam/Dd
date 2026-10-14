import "server-only";
import { createHash } from "node:crypto";
import { cookies, headers } from "next/headers";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { SIGNUP_BONUS_CREDITS } from "@/lib/pricing";
import { track } from "@/lib/analytics";

export const DEVICE_COOKIE = "did";
export const REFERRAL_COOKIE = "ref";
const maxAccountsPerIp = () => Number(process.env.SIGNUP_MAX_PER_IP ?? 3);

const h = (s: string) => createHash("sha256").update(`${env.sessionSecret()}:${s}`).digest("hex").slice(0, 32);

export interface Fingerprint {
  deviceId: string | null;
  ip: string | null;
}

export async function requestFingerprint(): Promise<Fingerprint> {
  const [c, hd] = await Promise.all([cookies(), headers()]);
  const ip = hd.get("x-forwarded-for")?.split(",")[0]?.trim() || hd.get("x-real-ip") || null;
  return { deviceId: c.get(DEVICE_COOKIE)?.value ?? null, ip };
}

/**
 * Grant the welcome bonus at most once per device (and a few times per IP), so farming accounts
 * doesn't farm credits. Idempotent per user via the ledger.
 */
export async function claimSignupBonus(userId: string, fp: Fingerprint): Promise<{ granted: boolean; reason?: string }> {
  if (await db().hasLedgerReason(userId, "signup_bonus")) return { granted: false, reason: "already_claimed" };
  const devPrior = fp.deviceId ? await db().recordSignupFingerprint(userId, `dev:${h(fp.deviceId)}`) : 0;
  const ipPrior = fp.ip ? await db().recordSignupFingerprint(userId, `ip:${h(fp.ip)}`) : 0;
  if (devPrior >= 1) return { granted: false, reason: "device_used" };
  if (ipPrior >= maxAccountsPerIp()) return { granted: false, reason: "ip_used" };
  const r = await db().applyCredit({ userId, delta: SIGNUP_BONUS_CREDITS, reason: "signup_bonus" });
  return { granted: r.applied };
}

/** Link the referrer from the `ref` cookie (set by proxy.ts on ?ref=CODE). Only for brand-new accounts. */
export async function attachReferral(userId: string): Promise<void> {
  const code = (await cookies()).get(REFERRAL_COOKIE)?.value;
  if (!code) return;
  const [me, referrer] = await Promise.all([db().getProfile(userId), db().getProfileByReferralCode(code)]);
  if (!me || !referrer || referrer.id === userId || me.referred_by) return;
  if (Date.now() - Date.parse(me.created_at) > 60 * 60_000) return;
  await db().updateProfile(userId, { referred_by: referrer.id });
}

/** Everything that happens right after an account is created (email signup or first OAuth login). */
export async function afterSignup(userId: string) {
  await attachReferral(userId);
  const bonus = await claimSignupBonus(userId, await requestFingerprint());
  if (bonus.granted || bonus.reason !== "already_claimed") await track(userId, "signed_up", { bonus: bonus.granted });
  return bonus;
}
