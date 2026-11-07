import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { postProcessOutput, watermark } from "@/lib/postprocess";
import type { Job } from "@/lib/types";

const probe = (bytes: Uint8Array, ext: string) => {
  const f = path.join(mkdtempSync(path.join(os.tmpdir(), "wmt-")), `x.${ext}`);
  writeFileSync(f, bytes);
  return execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", f]).toString().trim();
};

describe("free-tier watermark", () => {
  it("burns the logo into a 9:16 video and keeps its size", async () => {
    const src = new Uint8Array(readFileSync("public/mock/sample-9x16.mp4"));
    const out = await watermark({ bytes: src, contentType: "video/mp4" });
    expect(out.contentType).toBe("video/mp4");
    expect(Buffer.compare(Buffer.from(out.bytes), Buffer.from(src))).not.toBe(0);
    expect(probe(out.bytes, "mp4")).toBe("540,960");
  }, 60_000);

  it("watermarks images too", async () => {
    const out = await watermark({ bytes: new Uint8Array(readFileSync("public/mock/sample-1x1.jpg")), contentType: "image/jpeg" });
    expect(probe(out.bytes, "jpg")).toBe("720,720");
  });

  it("only applies to jobs flagged for it", async () => {
    const file = { bytes: new Uint8Array([1, 2, 3]), contentType: "video/mp4" };
    const paid = await postProcessOutput({ input_json: { prompt: "x", watermark: false } } as unknown as Job, file);
    expect(paid).toBe(file);
    // a broken file on a free job is passed through rather than failing the generation
    const free = await postProcessOutput({ input_json: { prompt: "x", watermark: true } } as unknown as Job, file);
    expect(free.bytes).toEqual(file.bytes);
  });
});
