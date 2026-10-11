import { getSessionUser } from "@/lib/auth";
import { createCheckout, productById, type ProductId } from "@/lib/billing";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

// Form POST from the billing/pricing pages → 303 to Stripe Checkout (or back, credited, in mock mode).
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return Response.redirect(`${env.appUrl()}/login?next=/billing`, 303);
  const form = await req.formData();
  const productId = String(form.get("product") ?? "");
  if (!productById(productId)) return new Response("unknown product", { status: 400 });
  const profile = await db().getProfile(user.id);
  if (!profile) return new Response("profile not found", { status: 404 });
  try {
    return Response.redirect(await createCheckout(profile, productId as ProductId), 303);
  } catch (e) {
    console.error("[checkout]", e);
    return Response.redirect(`${env.appUrl()}/billing?error=checkout`, 303);
  }
}
