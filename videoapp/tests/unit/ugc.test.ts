import { readFileSync, rmSync } from "node:fs";
import { beforeEach, describe, expect, it } from "vitest";
import { mockDb } from "@/lib/db/mock";
import { reconcileJob } from "@/lib/generation";
import { timeCaptions, buildAss } from "@/lib/ugc/captions";
import { estimateUgcCost, scriptText } from "@/lib/ugc/config";
import { advanceUgc, startUgcAd, type UgcAdSpec } from "@/lib/ugc/pipeline";
import { ANGLES, templateScript, writeScripts, type ProductBrief } from "@/lib/ugc/script";
import { moderateTextLocal } from "@/lib/moderation";
import { createUser } from "./helpers";

process.env.MOCK_PROVIDERS = "true";
process.env.MOCK_PROVIDER_WEBHOOKS = "false";
process.env.MOCK_PROVIDER_DELAY_MS = "0";
delete process.env.ANTHROPIC_API_KEY;

beforeEach(() => rmSync(".data-test", { recursive: true, force: true }));

const brief: ProductBrief = {
  name: "Glow Serum",
  description: "a lightweight vitamin C serum",
  benefits: ["soaks in fast", "no sticky feel", "smells like citrus"],
  audience: "people with busy mornings",
  offer: "20% off this week",
  tone: "friendly",
};

async function setup(credits = 1000, withImage = true) {
  const u = await createUser();
  await mockDb.applyCredit({ userId: u.id, delta: credits, reason: "admin" });
  let product_image_path: string | null = null;
  if (withImage) {
    product_image_path = `${u.id}/product.jpg`;
    await mockDb.uploadObject("uploads", product_image_path, new Uint8Array(readFileSync("public/mock/sample-1x1.jpg")), "image/jpeg");
  }
  const project = await mockDb.createUgcProject({
    user_id: u.id,
    product_name: brief.name,
    product_description: brief.description,
    product_url: null,
    benefits: brief.benefits,
    audience: brief.audience,
    offer: brief.offer,
    product_image_path,
  });
  const actor = (await mockDb.getUgcActor("maya"))!;
  return { profile: (await mockDb.getProfile(u.id))!, project, actor };
}

const spec = (o: Partial<UgcAdSpec> = {}): UgcAdSpec => ({
  script: templateScript(brief, "problem-solution"),
  aspect: "9:16",
  captions: "bold",
  broll: true,
  quality: "standard",
  aiLabel: true,
  ctaLabel: "Shop now →",
  ...o,
});

async function drive(jobId: string, max = 10) {
  let j = (await mockDb.getJob(jobId))!;
  for (let i = 0; i < max && (j.status === "running" || j.status === "queued"); i++) j = (await reconcileJob(j)) ?? j;
  return j;
}

describe("UGC scripts", () => {
  it("templates give one distinct, policy-safe script per angle within length", async () => {
    const { scripts, source } = await writeScripts(brief, 4);
    expect(source).toBe("template");
    expect(new Set(scripts.map((s) => s.angle)).size).toBe(4);
    for (const s of scripts) {
      const words = scriptText(s).split(/\s+/).length;
      expect(words).toBeGreaterThan(15);
      expect(words).toBeLessThanOrEqual(110);
      expect(s.hook.split(/\s+/).length).toBeLessThanOrEqual(10);
      expect(s.cta).toContain("20% off");
      expect(moderateTextLocal(scriptText(s)).allowed).toBe(true);
    }
    expect(ANGLES.length).toBeGreaterThanOrEqual(6);
  });
});

describe("UGC captions + pricing", () => {
  it("times caption chunks across the spoken duration in order", () => {
    const chunks = timeCaptions("one two three four five six seven", 7, "bold");
    expect(chunks.map((c) => c.text)).toEqual(["one two three", "four five six", "seven"]);
    for (let i = 1; i < chunks.length; i++) expect(chunks[i].start).toBeCloseTo(chunks[i - 1].end);
    expect(chunks.at(-1)!.end).toBeLessThanOrEqual(7);
    expect(timeCaptions("x y", 3, "none")).toEqual([]);
    const ass = buildAss({ width: 720, height: 1280, duration: 9, style: "bold", chunks, aiLabel: true, endCard: { title: "Glow", cta: "Shop", start: 7 } });
    expect(ass).toContain("AI-generated");
    expect(ass).toContain("Inter ExtraBold");
  });

  it("prices premium above standard and b-roll adds cost", () => {
    const t = scriptText(templateScript(brief, "pov"));
    const std = estimateUgcCost(t, { quality: "standard", broll: false, hasProductImage: true });
    const prem = estimateUgcCost(t, { quality: "premium", broll: false, hasProductImage: true });
    const withB = estimateUgcCost(t, { quality: "standard", broll: true, hasProductImage: true });
    expect(prem.credits).toBeGreaterThan(std.credits);
    expect(withB.credits).toBeGreaterThan(std.credits);
    expect(std.credits * 0.076).toBeGreaterThanOrEqual(std.usd * 3); // ≥ 3x at worst-case credit price
  });
});

describe("UGC pipeline (mock providers)", () => {
  it("runs voice → composite → avatar → b-roll → edit and stores a finished ad", async () => {
    const { profile, project, actor } = await setup();
    const job = await startUgcAd(profile, project, actor, spec());
    expect(job.kind).toBe("ugc");
    expect(job.stage).toBe("voice");
    const before = (await mockDb.getProfile(profile.id))!.credits_balance;
    expect(before).toBe(profile.credits_balance - job.credits_charged);

    const done = await drive(job.id);
    expect(done.status).toBe("succeeded");
    expect(done.stage).toBe("done");
    expect(done.output_url).toMatch(/\.mp4$/);
    const d = done.stage_data as Record<string, unknown>;
    expect(d.voice && d.composite && d.avatar && d.broll).toBeTruthy();
  }, 120_000);

  it("skips composite + b-roll without a product photo", async () => {
    const { profile, project, actor } = await setup(1000, false);
    const job = await startUgcAd(profile, project, actor, spec());
    const done = await drive(job.id);
    expect(done.status).toBe("succeeded");
    const d = done.stage_data as Record<string, unknown>;
    expect(d.composite).toBeUndefined();
    expect(d.broll).toBeUndefined();
  }, 120_000);

  it("a failure mid-pipeline refunds every credit exactly once", async () => {
    const { profile, project, actor } = await setup();
    const job = await startUgcAd(profile, project, actor, spec({ failAt: "avatar" }));
    const after = await drive(job.id);
    expect(after.status).toBe("refunded");
    expect(after.cost_usd).toBeGreaterThan(0); // voice + composite still cost us
    await drive(job.id);
    expect((await mockDb.getProfile(profile.id))!.credits_balance).toBe(profile.credits_balance);
  }, 60_000);

  it("a duplicate stage result can't double-advance the pipeline", async () => {
    const { profile, project, actor } = await setup();
    const job = await startUgcAd(profile, project, actor, spec({ broll: false }));
    const result = { state: "succeeded" as const, outputUrl: "http://localhost:3000/mock/ugc-voice.mp3" };
    const [a, b] = await Promise.all([advanceUgc(job, result), advanceUgc(job, result)]);
    const stages = [a?.stage, b?.stage];
    expect(stages).toContain("composite");
    const fresh = (await mockDb.getJob(job.id))!;
    expect(fresh.stage).toBe("composite");
  });

  it("refuses when credits are short", async () => {
    const { profile, project, actor } = await setup(0);
    await expect(startUgcAd(profile, project, actor, spec())).rejects.toMatchObject({ status: 402 });
  });
});
