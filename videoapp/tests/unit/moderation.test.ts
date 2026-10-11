import { describe, expect, it } from "vitest";
import { moderateTextLocal } from "@/lib/moderation";

describe("local moderation rules", () => {
  it.each([
    ["a nude model on the beach", "sexual"],
    ["sexy lingerie photoshoot", "sexual"],
    ["little girl in a bikini posing", "minors"],
    ["underage anything", "minors"],
    ["Taylor Swift dancing in Times Square", "public_figure"],
    ["elon  musk holding my product", "public_figure"],
    ["Spider-Man swinging past my sneakers", "protected_ip"],
    ["pikachu unboxing a phone", "protected_ip"],
  ])("blocks %j (%s)", (prompt, reason) => {
    const r = moderateTextLocal(prompt);
    expect(r.allowed).toBe(false);
    expect(r.reasons).toContain(reason);
  });

  it.each([
    "glass serum bottle on wet black stone, slow orbit",
    "woman holding a skincare jar, talking to camera, kitchen",
    "sneaker floating on water at sunset, 360 spin",
    "kids toy car product shot on white background",
  ])("allows %j", (prompt) => {
    expect(moderateTextLocal(prompt).allowed).toBe(true);
  });
});
