import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { checkRateLimit } from "@/lib/abuse";
import { db } from "@/lib/db";
import { moderateText, moderationMessage } from "@/lib/moderation";
import { MAX_VARIATIONS, scriptText } from "@/lib/ugc/config";
import { startUgcAd, UgcError } from "@/lib/ugc/pipeline";
import type { Job } from "@/lib/types";

export const maxDuration = 300;

const Script = z.object({
  angle: z.string().max(40),
  hook: z.string().trim().min(1).max(140),
  body: z.array(z.string().max(300)).max(6),
  cta: z.string().max(160),
  on_screen_hook: z.string().max(40),
});

const Body = z.object({
  product: z.object({
    name: z.string().trim().min(1).max(80),
    description: z.string().max(400).default(""),
    benefits: z.array(z.string().max(120)).max(5).default([]),
    audience: z.string().max(120).default(""),
    offer: z.string().max(80).default(""),
    url: z.string().max(300).optional(),
    imagePath: z.string().max(300).nullish(),
  }),
  scripts: z.array(Script).min(1).max(MAX_VARIATIONS),
  actorIds: z.array(z.string()).min(1).max(3),
  aspect: z.enum(["9:16", "4:5", "1:1"]).default("9:16"),
  captions: z.enum(["bold", "clean", "none"]).default("bold"),
  broll: z.boolean().default(true),
  quality: z.enum(["standard", "premium"]).default("standard"),
  aiLabel: z.boolean().default(true),
  ctaLabel: z.string().max(30).default("Shop now →"),
  failAt: z.enum(["voice", "composite", "avatar", "broll"]).optional(),
});

/** One job per (script × creator). Each is charged and refunded independently. */
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Log in first." }, { status: 401 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid request." }, { status: 400 });
  const b = parsed.data;
  if (b.scripts.length * b.actorIds.length > MAX_VARIATIONS)
    return Response.json({ error: `Up to ${MAX_VARIATIONS} ads per batch.` }, { status: 400 });
  if (b.product.imagePath && !b.product.imagePath.startsWith(`${user.id}/`))
    return Response.json({ error: "Invalid upload." }, { status: 400 });

  const profile = await db().getProfile(user.id);
  if (!profile) return Response.json({ error: "Profile not found." }, { status: 404 });
  const limited = await checkRateLimit(profile.id);
  if (limited) return Response.json({ error: limited }, { status: 429 });

  for (const s of b.scripts) {
    const mod = await moderateText([b.product.name, scriptText(s), s.on_screen_hook].join("\n"));
    if (!mod.allowed) {
      await db().logModeration({ userId: user.id, kind: "text", excerpt: s.hook, reasons: mod.reasons, source: mod.source });
      return Response.json({ error: moderationMessage(mod.reasons) }, { status: 422 });
    }
  }
  const actors = await Promise.all(b.actorIds.map((id) => db().getUgcActor(id)));
  if (actors.some((a) => !a || !a.enabled || (a.owner_id && a.owner_id !== user.id)))
    return Response.json({ error: "Pick a creator from the library." }, { status: 400 });

  const project = await db().createUgcProject({
    user_id: user.id,
    product_name: b.product.name,
    product_description: b.product.description,
    product_url: b.product.url ?? null,
    benefits: b.product.benefits,
    audience: b.product.audience,
    offer: b.product.offer,
    product_image_path: b.product.imagePath ?? null,
  });

  const jobs: Job[] = [];
  const errors: string[] = [];
  for (const actor of actors) {
    for (const script of b.scripts) {
      try {
        jobs.push(
          await startUgcAd(profile, project, actor!, {
            script,
            aspect: b.aspect,
            captions: b.captions,
            broll: b.broll,
            quality: b.quality,
            aiLabel: b.aiLabel,
            ctaLabel: b.ctaLabel,
            failAt: b.failAt,
          }),
        );
      } catch (e) {
        errors.push(e instanceof UgcError ? e.message : "Something went wrong.");
        if (e instanceof UgcError && e.status === 402) break;
      }
    }
  }
  const balance = (await db().getProfile(user.id))?.credits_balance ?? 0;
  if (!jobs.length) return Response.json({ error: errors[0] ?? "Nothing was started." }, { status: 402 });
  return Response.json({ jobs, balance, errors });
}
