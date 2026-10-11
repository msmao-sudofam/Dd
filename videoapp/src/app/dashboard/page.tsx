import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { signOutAction } from "../(auth)/actions";

export const metadata = { title: "Account" };

export default async function DashboardPage() {
  const profile = await requireProfile("/dashboard");
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

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="card p-6">
          <div className="label">Plan</div>
          <div className="text-xl font-bold capitalize">{profile.plan}</div>
          {profile.plan === "free" && (
            <p className="mt-1 text-sm text-muted">Free-plan videos carry a small watermark.</p>
          )}
        </div>
        <div className="card p-6">
          <div className="label">Invite friends</div>
          <code className="text-sm" data-testid="referral-code">{profile.referral_code}</code>
          <p className="mt-1 text-sm text-muted">
            You both get bonus credits after their first purchase.
          </p>
        </div>
      </div>

      <form action={signOutAction} className="mt-10">
        <button className="btn-ghost">Log out</button>
      </form>
    </div>
  );
}
