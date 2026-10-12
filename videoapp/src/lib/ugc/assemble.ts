import "server-only";
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { buildAss, timeCaptions } from "./captions";
import { ASPECT_SIZE, type CaptionStyle, type UgcAspect } from "./config";

const run = promisify(execFile);

async function ffmpegBin(): Promise<string> {
  if (process.env.FFMPEG_PATH) return process.env.FFMPEG_PATH;
  try {
    const p = ((await import("ffmpeg-static")) as unknown as { default: string | null }).default;
    if (p && existsSync(p)) return p;
  } catch {}
  if (existsSync("/usr/bin/ffmpeg")) return "/usr/bin/ffmpeg";
  throw new Error("ffmpeg not available");
}

const fontsDir = () => path.join(/*turbopackIgnore: true*/ process.cwd(), "assets", "fonts");

/** A file path as a filter option value: forward slashes and an escaped drive colon, so Windows paths survive. */
const filterPath = (p: string) => `'${p.replace(/\\/g, "/").replace(/:/g, "\\:")}'`;

/** Duration from ffmpeg's own banner (ffmpeg-static ships without ffprobe). */
export async function mediaDuration(file: string): Promise<number> {
  const bin = await ffmpegBin();
  const { stderr } = await run(bin, ["-hide_banner", "-i", file], { timeout: 30_000 }).catch((e) => e as { stderr: string });
  const m = /Duration: (\d+):(\d+):(\d+(?:\.\d+)?)/.exec(stderr ?? "");
  if (!m) throw new Error("could not read media duration");
  return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
}

export interface AssembleInput {
  avatar: Uint8Array; // talking-creator video with the voiceover audio
  broll?: Uint8Array | null; // optional product cutaway
  aspect: UgcAspect;
  script: { hook: string; body: string[]; cta: string; on_screen_hook: string };
  captions: CaptionStyle;
  productName: string;
  ctaLabel: string;
  aiLabel: boolean;
}

/**
 * The edit: frame the creator to the target aspect, cut to product b-roll after the hook while the voice
 * keeps going, burn captions + on-screen hook + "AI-generated" tag, and hold a 1.6 s end card.
 */
export async function assembleUgc(i: AssembleInput): Promise<Uint8Array> {
  const bin = await ffmpegBin();
  const { w, h } = ASPECT_SIZE[i.aspect];
  const dir = await mkdtemp(path.join(os.tmpdir(), "ugc-"));
  try {
    const avatar = path.join(dir, "avatar.mp4");
    await writeFile(avatar, i.avatar);
    const spoken = await mediaDuration(avatar);
    const endCard = 1.6;
    const total = spoken + endCard;
    const text = [i.script.hook, ...i.script.body, i.script.cta].join(" ");
    const hookWords = i.script.hook.split(/\s+/).length;
    const totalWords = text.split(/\s+/).length;
    const hookEnd = Math.min(spoken * 0.45, Math.max(1.6, (hookWords / totalWords) * spoken + 0.3));

    const ass = buildAss({
      width: w,
      height: h,
      duration: total,
      style: i.captions,
      chunks: timeCaptions(text, spoken, i.captions),
      onScreenHook: i.script.on_screen_hook,
      hookEnd,
      endCard: { title: i.productName, cta: i.ctaLabel, start: spoken },
      aiLabel: i.aiLabel,
    });
    const assFile = path.join(dir, "captions.ass");
    await writeFile(assFile, ass);

    const args = ["-y", "-loglevel", "error", "-i", avatar];
    const cover = `scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h},setsar=1`;
    // Hold the last frame through the end card, darkened.
    let graph = `[0:v]${cover},tpad=stop_mode=clone:stop_duration=${endCard}[v0];`;
    let last = "v0";
    if (i.broll) {
      const broll = path.join(dir, "broll.mp4");
      await writeFile(broll, i.broll);
      const bStart = hookEnd;
      const bEnd = Math.min(spoken - 1, bStart + 3.2);
      if (bEnd - bStart > 1) {
        args.push("-i", broll);
        graph += `[1:v]${cover},trim=0:${(bEnd - bStart).toFixed(2)},setpts=PTS-STARTPTS+${bStart.toFixed(2)}/TB[b];`;
        graph += `[${last}][b]overlay=enable='between(t,${bStart.toFixed(2)},${bEnd.toFixed(2)})':eof_action=pass[v1];`;
        last = "v1";
      }
    }
    graph += `[${last}]drawbox=x=0:y=0:w=iw:h=ih:color=black@0.55:t=fill:enable='gte(t,${spoken.toFixed(2)})',`;
    graph += `subtitles=filename=${filterPath(assFile)}:fontsdir=${filterPath(fontsDir())},format=yuv420p[vout];`;
    graph += `[0:a]apad=pad_dur=${endCard}[aout]`;
    const out = path.join(dir, "out.mp4");
    args.push(
      "-filter_complex", graph,
      "-map", "[vout]", "-map", "[aout]",
      "-t", total.toFixed(2),
      "-c:v", "libx264", "-preset", "veryfast", "-crf", "21",
      "-c:a", "aac", "-b:a", "128k",
      "-movflags", "+faststart",
      out,
    );
    await run(bin, args, { timeout: 280_000 });
    if (!existsSync(out)) throw new Error("assembly produced no output");
    return new Uint8Array(await readFile(out));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
