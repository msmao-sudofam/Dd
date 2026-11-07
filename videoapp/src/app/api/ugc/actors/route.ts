import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const user = await getSessionUser();
  return Response.json({ actors: await db().listUgcActors(user?.id ?? null) });
}

const Body = z.object({
  name: z.string().trim().min(1).max(40),
  uploadPath: z.string().max(300),
  voice: z.string().max(40),
  consent: z.literal(true),
});

/** "Use my own face": the uploaded selfie becomes a private creator only this user can cast. */
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Log in first." }, { status: 401 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Add a name, a selfie, and confirm it's you." }, { status: 400 });
  if (!parsed.data.uploadPath.startsWith(`${user.id}/`)) return Response.json({ error: "Invalid upload." }, { status: 400 });
  await db().logConsent({
    userId: user.id,
    uploadPath: parsed.data.uploadPath,
    statement: "This is a photo of me and I consent to an AI version of my face and a synthetic voice being used in my ads.",
    ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    userAgent: req.headers.get("user-agent"),
  });
  const actor = await db().createUgcActor({
    slug: `me-${user.id.slice(0, 8)}-${Date.now().toString(36)}`,
    name: parsed.data.name,
    vibe: "You",
    age_range: "",
    setting: "Your own space",
    portrait_url: null,
    preview_video_url: null,
    voice: parsed.data.voice,
    voice_label: "",
    tags: ["you"],
    owner_id: user.id,
    upload_path: parsed.data.uploadPath,
    sort_order: 0,
    enabled: true,
  });
  return Response.json({ actor: { ...actor, portrait_url: await db().objectUrl("uploads", actor.upload_path!, 3600) } });
}
