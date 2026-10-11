import { rmSync, existsSync } from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import { mockCreateUser, mockDb, storageDir } from "@/lib/db/mock";
import { completeJob, failJob, GenerationError, reconcileJob, renderPresetPrompt, startGeneration } from "@/lib/generation";
import { SIGNUP_BONUS_CREDITS } from "@/lib/pricing";

process.env.MOCK_PROVIDERS = "true";
process.env.MOCK_PROVIDER_WEBHOOKS = "false";
process.env.MOCK_PROVIDER_DELAY_MS = "0";

beforeEach(() => rmSync(".data-test", { recursive: true, force: true }));

async function setup(credits = SIGNUP_BONUS_CREDITS) {
  const u = await mockCreateUser(`u${Math.random()}@example.com`, "h");
  if (credits !== SIGNUP_BONUS_CREDITS)
    await mockDb.applyCredit({ userId: u.id, delta: credits - SIGNUP_BONUS_CREDITS, reason: "admin" });
  const fast = (await mockDb.getModel("ltx-fast"))!;
  return { profile: (await mockDb.getProfile(u.id))!, fast };
}

describe("generation engine (mock provider)", () => {
  it("debits on submit, then stores the output and succeeds", async () => {
    const { profile, fast } = await setup();
    const job = await startGeneration(profile, { modelId: fast.id, prompt: "a sneaker on water", duration: 6 });
    expect(job.status).toBe("running");
    expect(job.provider).toBe("mock");
    expect(job.input_json.aspect_ratio).toBe("9:16");
    expect((await mockDb.getProfile(profile.id))!.credits_balance).toBe(SIGNUP_BONUS_CREDITS - 24);

    const done = await reconcileJob(job);
    expect(done?.status).toBe("succeeded");
    expect(done?.output_url).toMatch(new RegExp(`/api/storage/outputs/${profile.id}/${job.id}\\.mp4$`));
    expect(existsSync(path.join(storageDir(), "outputs", profile.id, `${job.id}.mp4`))).toBe(true);
  });

  it("refunds exactly once when the provider fails", async () => {
    const { profile, fast } = await setup();
    const job = await startGeneration(profile, { modelId: fast.id, prompt: "x", forceFail: true });
    const after = await reconcileJob(job);
    expect(after?.status).toBe("refunded");
    await failJob(job.id, "again"); // duplicate webhook
    await reconcileJob((await mockDb.getJob(job.id))!);
    expect((await mockDb.getProfile(profile.id))!.credits_balance).toBe(SIGNUP_BONUS_CREDITS);
    const reasons = (await mockDb.listLedger(profile.id)).map((l) => l.reason).sort();
    expect(reasons).toEqual(["generation", "refund", "signup_bonus"]);
  });

  it("completion is idempotent and can't resurrect a refunded job", async () => {
    const { profile, fast } = await setup();
    const job = await startGeneration(profile, { modelId: fast.id, prompt: "x", forceFail: true });
    await reconcileJob(job);
    const again = await completeJob(job.id, "http://localhost:3000/mock/sample-9x16.mp4");
    expect(again?.status).toBe("refunded");
  });

  it("rejects insufficient balance before charging", async () => {
    const { profile } = await setup();
    const veo = (await mockDb.getModel("veo-31"))!;
    await expect(startGeneration(profile, { modelId: veo.id, prompt: "x" })).rejects.toMatchObject({ status: 402 });
    expect(await mockDb.listJobs(profile.id)).toHaveLength(0);
  });

  it("blocks moderated prompts without charging and logs them", async () => {
    const { profile, fast } = await setup();
    await expect(startGeneration(profile, { modelId: fast.id, prompt: "Taylor Swift in my ad" })).rejects.toMatchObject({
      status: 422,
      code: "moderation_blocked",
    });
    expect((await mockDb.getProfile(profile.id))!.credits_balance).toBe(SIGNUP_BONUS_CREDITS);
  });

  it("validates duration, aspect and required image", async () => {
    const { profile, fast } = await setup(500);
    const i2v = (await mockDb.getModel("ltx-i2v"))!;
    await expect(startGeneration(profile, { modelId: fast.id, prompt: "x", duration: 7 })).rejects.toBeInstanceOf(GenerationError);
    await expect(startGeneration(profile, { modelId: fast.id, prompt: "x", aspectRatio: "4:3" })).rejects.toBeInstanceOf(GenerationError);
    await expect(startGeneration(profile, { modelId: i2v.id, prompt: "x" })).rejects.toMatchObject({ code: "image_required" });
    await expect(
      startGeneration(profile, { modelId: i2v.id, prompt: "x", imagePath: "someone-else/img.png" }),
    ).rejects.toMatchObject({ code: "bad_upload" });
  });

  it("charges per second for longer clips", async () => {
    const { profile, fast } = await setup(500);
    const job = await startGeneration(profile, { modelId: fast.id, prompt: "x", duration: 10 });
    expect(job.credits_charged).toBe(40);
    expect(job.cost_usd).toBeCloseTo(0.6);
  });

  it("renders preset prompts", () => {
    expect(renderPresetPrompt({ prompt_template: "{subject} spinning, {subject} glowing" }, "red sneaker")).toBe(
      "red sneaker spinning, red sneaker glowing",
    );
    expect(renderPresetPrompt({ prompt_template: "{subject} on water" })).toBe("the product on water");
  });
});
