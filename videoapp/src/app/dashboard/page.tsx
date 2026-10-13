import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { REFERRAL_BONUS_CREDITS, subscribedPlan } from "@/lib/pricing";
import { signOutAction } from "../(auth)/actions";

export const metadata = { title: "Account" };

export default async function DashboardPage() {
  const profile = await requireProfile("/dashboard");
  const gotBonus = await db().hasLedgerReason(profile.id, "signup_bonus");
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-sm text-muted">{profile.email}</p>
      <h1 className="mt-1 text-3xl font-black tracking-tight">Your account</h1>

      <div className="card mt-8 flex flex-wrap items-center gap-6 p-6">
        <div>
          <div className="label">Credit balance</div>
          <div className="text-5xl font-black" data-testid="dashboard-balance">{profile.credits_balance}</div>
        </div>
        <div className="ml-auto flex gap-2">
          <Link href="/presets" className="btn-primary">Make a video</Link>
          <Link href="/billing" className="btn-ghost">Buy credits</Link>
        </div>
      </div>

      {!gotBonus && (
        <p className="mt-4 text-sm text-muted" data-testid="bonus-denied">
          The free welcome credits were already claimed from this device. Grab a credit pack to get started.
        </p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="card p-6">
          <div className="label">Plan</div>
          <div className="text-xl font-bold capitalize">{subscribedPlan(profile)?.name ?? profile.plan}</div>
          {profile.plan === "free" && (
            <p className="mt-1 text-sm text-muted">Free-plan videos carry a small watermark.</p>
          )}
        </div>
        <div className="card p-6">
          <div className="label">Invite friends</div>
          <code className="block break-all text-sm" data-testid="referral-link">{`${env.appUrl()}/?ref=${profile.referral_code}`}</code>
          <p className="mt-1 text-sm text-muted">
            You both get {REFERRAL_BONUS_CREDITS} credits after their first purchase.
          </p>
        </div>
      </div>

      <form action={signOutAction} className="mt-10">
        <button className="btn-ghost">Log out</button>
      </form>
    </div>
  );
}
