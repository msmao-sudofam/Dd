import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { moderateText, moderationMessage } from "@/lib/moderation";
import { writeScripts } from "@/lib/ugc/script";

const Body = z.object({
  name: z.string().trim().min(1).max(80),
  description: z.string().max(400).default(""),
  benefits: z.array(z.string().max(120)).max(5).default([]),
  audience: z.string().max(120).default(""),
  offer: z.string().max(80).default(""),
  tone: z.enum(["friendly", "hype", "calm", "funny"]).default("friendly"),
  count: z.number().int().min(1).max(6).default(4),
});

// Free: writing scripts costs us an LLM call at most; generation is where credits are spent.
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Log in first." }, { status: 401 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Tell us the product name at least." }, { status: 400 });
  const b = parsed.data;
  const mod = await moderateText([b.name, b.description, ...b.benefits, b.audience, b.offer].join("\n"));
  if (!mod.allowed) {
    await db().logModeration({ userId: user.id, kind: "text", excerpt: b.name, reasons: mod.reasons, source: mod.source });
    return Response.json({ error: moderationMessage(mod.reasons) }, { status: 422 });
  }
  const { scripts, source } = await writeScripts(b, b.count);
  return Response.json({ scripts, source });
}
