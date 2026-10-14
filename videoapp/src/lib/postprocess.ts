import "server-only";
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import type { Job } from "@/lib/types";

const run = promisify(execFile);

export interface OutputFile {
  bytes: Uint8Array;
  contentType: string;
}

async function ffmpegPath(): Promise<string | null> {
  if (process.env.FFMPEG_PATH) return process.env.FFMPEG_PATH;
  try {
    const p = ((await import("ffmpeg-static")) as unknown as { default: string | null }).default;
    if (p && existsSync(p)) return p;
  } catch {}
  return existsSync("/usr/bin/ffmpeg") ? "/usr/bin/ffmpeg" : null;
}

const watermarkPng = () => path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "watermark.png");

/**
 * Burn a small corner logo into free-tier outputs — every post becomes an ad.
 * Logo = public/watermark.png (replace with your brand mark). Width ≈ 28% of the frame, bottom-right.
 */
export async function watermark(file: OutputFile): Promise<OutputFile> {
  const ffmpeg = await ffmpegPath();
  if (!ffmpeg || !existsSync(watermarkPng())) throw new Error("ffmpeg or watermark.png unavailable");
  const dir = await mkdtemp(path.join(os.tmpdir(), "wm-"));
  const isVideo = file.contentType === "video/mp4";
  const inExt = isVideo ? "mp4" : file.contentType === "image/png" ? "png" : file.contentType === "image/webp" ? "webp" : "jpg";
  const input = path.join(dir, `in.${inExt}`);
  const output = path.join(dir, isVideo ? "out.mp4" : "out.jpg");
  try {
    await writeFile(input, file.bytes);
    // Images: loop both inputs and take one frame. With a single-frame base and shortest=1, the base can hit EOF
    // before the logo's first frame reaches overlay, and ffmpeg then encodes nothing (seen intermittently on CI).
    const filter =
      "[1:v][0:v]scale2ref=w=main_w*0.3:h=-1[wm][base];[base][wm]overlay=x=main_w-overlay_w-main_w*0.03:y=main_h-overlay_h-main_h*0.03" +
      (isVideo ? ":shortest=1" : "");
    const args = ["-y", "-loglevel", "warning", ...(isVideo ? [] : ["-loop", "1"]), "-i", input, "-loop", "1", "-i", watermarkPng(), "-filter_complex", filter];
    if (isVideo) args.push("-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-pix_fmt", "yuv420p", "-c:a", "copy", "-movflags", "+faststart");
    else args.push("-frames:v", "1", "-q:v", "2");
    args.push(output);
    const { stderr } = await run(ffmpeg, args, { timeout: 240_000 });
    if (!existsSync(output)) throw new Error(`ffmpeg produced no output: ${stderr.slice(-400)}`);
    return { bytes: new Uint8Array(await readFile(output)), contentType: isVideo ? "video/mp4" : "image/jpeg" };
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

/** Hook between download and storage. */
export async function postProcessOutput(job: Job, file: OutputFile): Promise<OutputFile> {
  if (!job.input_json.watermark) return file;
  try {
    return await watermark(file);
  } catch (e) {
    // A missing watermark only loses us an ad; never fail the user's paid generation over it.
    console.error("[watermark] skipped:", (e as Error).message);
    return file;
  }
}
