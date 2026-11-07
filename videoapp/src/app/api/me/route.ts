import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });
  const p = await db().getProfile(user.id);
  return Response.json({
    id: user.id,
    email: user.email,
    credits_balance: p?.credits_balance ?? 0,
    plan: p?.plan ?? "free",
    referral_code: p?.referral_code,
  });
}
