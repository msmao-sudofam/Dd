import { getSessionUser } from "@/lib/auth";
import { changePlan, createCheckout, productById, type ProductId } from "@/lib/billing";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { subscribedPlan } from "@/lib/pricing";

// Form POST from the billing/pricing pages → 303 to Stripe Checkout (or back, credited, in mock mode).
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return Response.redirect(`${env.appUrl()}/login?next=/billing`, 303);
  const form = await req.formData();
  const productId = String(form.get("product") ?? "");
  const product = productById(productId);
  if (!product) return new Response("unknown product", { status: 400 });
  const profile = await db().getProfile(user.id);
  if (!profile) return new Response("profile not found", { status: 404 });
  const to = (path: string) => Response.redirect(`${env.appUrl()}${path}`, 303);

  // Already subscribed: this is a plan change, not a second subscription. An upgrade charges the card on
  // file, so it only runs from the confirm step on the billing page, where the amount is spelled out.
  const current = subscribedPlan(profile);
  if (product.kind === "monthly" && current) {
    if (current.id === product.plan.id) return to("/billing");
    if (form.get("confirm") !== "1") return to(`/billing?change=${product.plan.id}`);
    try {
      const change = await changePlan(profile, product.plan);
      return to(change === "upgrade" ? "/billing?success=1" : `/billing?changed=${product.plan.id}`);
    } catch (e) {
      console.error("[plan change]", e);
      return to("/billing?error=change");
    }
  }

  try {
    return Response.redirect(await createCheckout(profile, productId as ProductId), 303);
  } catch (e) {
    console.error("[checkout]", e);
    return to("/billing?error=checkout");
  }
}
