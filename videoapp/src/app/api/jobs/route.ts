import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { reconcileJob } from "@/lib/generation";
import type { Job } from "@/lib/types";

// Downloading + watermarking + re-uploading a clip can take a while.
export const maxDuration = 300;

// GET /api/jobs            → recent jobs
// GET /api/jobs?ids=a,b    → those jobs (pending ones are reconciled with the provider)
export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Log in first." }, { status: 401 });
  const ids = new URL(req.url).searchParams.get("ids")?.split(",").filter(Boolean) ?? null;

  let jobs: Job[];
  if (ids) {
    const found = await Promise.all(ids.slice(0, 20).map((id) => db().getJob(id)));
    jobs = found.filter((j): j is Job => !!j && j.user_id === user.id);
    jobs = (await Promise.all(jobs.map(async (j) => (await reconcileJob(j)) ?? j)));
  } else {
    jobs = await db().listJobs(user.id, 60);
  }
  const balance = (await db().getProfile(user.id))?.credits_balance ?? 0;
  return Response.json({ jobs, balance });
}
