import { getSessionUser } from "@/lib/auth";
import { createPortalUrl } from "@/lib/billing";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

export async function POST() {
  const user = await getSessionUser();
  if (!user) return Response.redirect(`${env.appUrl()}/login?next=/billing`, 303);
  const profile = await db().getProfile(user.id);
  const url = profile && (await createPortalUrl(profile));
  return Response.redirect(url ?? `${env.appUrl()}/billing?portal=unavailable`, 303);
}
