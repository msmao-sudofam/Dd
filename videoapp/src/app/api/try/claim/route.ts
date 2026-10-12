import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { claimTry, currentTry } from "@/lib/try/session";

const Body = z.object({ presetSlug: z.string().max(80) });

/** After sign-up: copy the previewed photo (or its ad still) into the account so a preset can animate it. */
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Log in first." }, { status: 401 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid request." }, { status: 400 });
  const [profile, s] = await Promise.all([db().getProfile(user.id), currentTry()]);
  if (!profile) return Response.json({ error: "Profile not found." }, { status: 404 });
  if (!s) return Response.json({ error: "Your preview photo has expired. Upload it again." }, { status: 404 });
  if (s.claimed_by && s.claimed_by !== profile.id) return Response.json({ error: "This preview belongs to another account." }, { status: 403 });
  try {
    return Response.json(await claimTry(profile, s, parsed.data.presetSlug));
  } catch (e) {
    console.error("[api/try/claim]", e);
    return Response.json({ error: "We couldn't carry your photo over. Upload it again." }, { status: 500 });
  }
}
