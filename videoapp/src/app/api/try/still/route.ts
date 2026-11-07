import { z } from "zod";
import { track } from "@/lib/analytics";
import { currentTry, startStill, TryError, tryView } from "@/lib/try/session";

export const maxDuration = 60;

const Body = z.object({ look: z.string().max(40) });

/** Start one free ad still of the visitor's product. The browser then polls GET /api/try. */
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Pick one of the looks." }, { status: 400 });
  try {
    const s = await currentTry();
    if (!s) return Response.json({ error: "Add your product photo first." }, { status: 404 });
    const next = await startStill(s, parsed.data.look);
    await track(`try:${s.id}`, "try_still_started", { look: parsed.data.look, provider: next.still_provider });
    return Response.json({ session: await tryView(next) });
  } catch (e) {
    if (e instanceof TryError) return Response.json({ error: e.message }, { status: e.status });
    console.error("[api/try/still]", e);
    return Response.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }
}
