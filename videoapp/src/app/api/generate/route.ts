import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { GenerationError, startGeneration } from "@/lib/generation";
import { checkRateLimit } from "@/lib/abuse";

const Body = z.object({
  modelId: z.string().optional(),
  presetId: z.string().optional(),
  prompt: z.string().max(2000).optional(),
  subject: z.string().max(200).optional(),
  imagePath: z.string().max(300).nullish(),
  duration: z.number().int().positive().nullish(),
  aspectRatio: z.string().max(10).nullish(),
  forceFail: z.boolean().optional(),
});

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Log in first." }, { status: 401 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid request." }, { status: 400 });
  if (!parsed.data.modelId && !parsed.data.presetId)
    return Response.json({ error: "Pick a model or preset." }, { status: 400 });

  const profile = await db().getProfile(user.id);
  if (!profile) return Response.json({ error: "Profile not found." }, { status: 404 });

  const limited = await checkRateLimit(profile.id);
  if (limited) return Response.json({ error: limited }, { status: 429 });

  try {
    const job = await startGeneration(profile, parsed.data);
    const balance = (await db().getProfile(user.id))?.credits_balance ?? 0;
    return Response.json({ job, balance });
  } catch (e) {
    if (e instanceof GenerationError) return Response.json({ error: e.message, code: e.code }, { status: e.status });
    console.error("[api/generate]", e);
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}
