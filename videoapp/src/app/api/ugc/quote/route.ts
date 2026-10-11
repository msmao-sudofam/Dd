import { z } from "zod";
import { estimateUgcCost, scriptText } from "@/lib/ugc/config";

const Body = z.object({
  scripts: z.array(z.object({ hook: z.string(), body: z.array(z.string()), cta: z.string() })).max(6),
  actors: z.number().int().min(1).max(3),
  quality: z.enum(["standard", "premium"]),
  broll: z.boolean(),
  hasProductImage: z.boolean(),
});

/** Exact credit cost for a batch, shown before the user generates. */
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid request." }, { status: 400 });
  const { scripts, actors, ...o } = parsed.data;
  const per = scripts.map((s) => estimateUgcCost(scriptText(s), o));
  return Response.json({
    perScript: per.map((p) => ({ credits: p.credits, seconds: p.seconds })),
    total: per.reduce((a, p) => a + p.credits, 0) * actors,
  });
}
