import { rmSync } from "node:fs";
import { beforeEach, describe, expect, it } from "vitest";
import { checkRateLimit } from "@/lib/abuse";
import { mockDb } from "@/lib/db/mock";
import { isDisposableEmail } from "@/lib/disposable-domains";
import { createUser } from "./helpers";

beforeEach(() => rmSync(".data-test", { recursive: true, force: true }));

describe("abuse limits", () => {
  it("blocks disposable email domains (and their subdomains)", () => {
    expect(isDisposableEmail("x@mailinator.com")).toBe(true);
    expect(isDisposableEmail("x@foo.mailinator.com")).toBe(true);
    expect(isDisposableEmail("x@YOPMAIL.com")).toBe(true);
    expect(isDisposableEmail("x@gmail.com")).toBe(false);
    expect(isDisposableEmail("not-an-email")).toBe(true);
  });

  it("rate-limits generations per user per minute", async () => {
    const u = await createUser();
    const m = (await mockDb.getModel("draft-self"))!;
    for (let i = 0; i < 6; i++) {
      expect(await checkRateLimit(u.id)).toBeNull();
      await mockDb.createJob({ user_id: u.id, model_id: m.id, input_json: { prompt: "x" }, provider: "mock", output_type: "video" });
    }
    expect(await checkRateLimit(u.id)).toMatch(/Wait a minute/);
  });
});
