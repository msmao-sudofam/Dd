import type { CaptionStyle } from "./config";

export interface CaptionChunk {
  start: number;
  end: number;
  text: string;
}

/**
 * Spread words over the spoken duration, weighted by length (longer words take longer to say),
 * then group them into on-screen chunks. Good enough for punchy UGC captions without word timestamps.
 */
export function timeCaptions(text: string, duration: number, style: CaptionStyle, lead = 0.12): CaptionChunk[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (!words.length || style === "none") return [];
  const per = style === "bold" ? 3 : 6;
  const weights = words.map((w) => w.replace(/[^\p{L}\p{N}]/gu, "").length + 2 + (/[.!?,]$/.test(w) ? 2 : 0));
  const total = weights.reduce((a, b) => a + b, 0);
  const span = Math.max(0.5, duration - lead - 0.1);
  const chunks: CaptionChunk[] = [];
  let t = lead;
  for (let i = 0; i < words.length; i += per) {
    const group = words.slice(i, i + per);
    const w = weights.slice(i, i + per).reduce((a, b) => a + b, 0);
    const d = (w / total) * span;
    chunks.push({ start: t, end: t + d, text: group.join(" ") });
    t += d;
  }
  return chunks;
}

const ts = (s: number) => {
  const cs = Math.max(0, Math.round(s * 100));
  const h = Math.floor(cs / 360000);
  const m = Math.floor((cs % 360000) / 6000);
  const sec = Math.floor((cs % 6000) / 100);
  return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}.${String(cs % 100).padStart(2, "0")}`;
};
const esc = (s: string) => s.replace(/[{}\\]/g, "").replace(/\n/g, " ");

export interface AssOptions {
  width: number;
  height: number;
  duration: number;
  style: CaptionStyle;
  chunks: CaptionChunk[];
  onScreenHook?: string;
  hookEnd?: number;
  endCard?: { title: string; cta: string; start: number };
  aiLabel?: boolean;
}

/** Build an ASS subtitle file (libass renders it with the bundled Inter fonts). */
export function buildAss(o: AssOptions): string {
  const s = o.width / 720; // styles are authored at 720px wide
  const big = Math.round(58 * s);
  const small = Math.round(34 * s);
  const header = `[Script Info]
ScriptType: v4.00+
PlayResX: ${o.width}
PlayResY: ${o.height}
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Bold,Inter ExtraBold,${big},&H00FFFFFF,&H0000FFFF,&H00000000,&H64000000,0,0,0,0,100,100,0,0,1,${Math.round(5 * s)},0,5,${Math.round(40 * s)},${Math.round(40 * s)},0,1
Style: Clean,Inter SemiBold,${small},&H00FFFFFF,&H00FFFFFF,&H00000000,&H96000000,0,0,0,0,100,100,0,0,3,${Math.round(10 * s)},0,2,${Math.round(48 * s)},${Math.round(48 * s)},${Math.round(150 * s)},1
Style: Hook,Inter ExtraBold,${Math.round(44 * s)},&H00000000,&H00000000,&H00FFFFFF,&H00FFFFFF,0,0,0,0,100,100,0,0,3,${Math.round(14 * s)},0,8,${Math.round(40 * s)},${Math.round(40 * s)},${Math.round(150 * s)},1
Style: Tag,Inter SemiBold,${Math.round(20 * s)},&H00FFFFFF,&H00FFFFFF,&H00000000,&H78000000,0,0,0,0,100,100,0,0,3,${Math.round(6 * s)},0,7,${Math.round(28 * s)},${Math.round(28 * s)},${Math.round(28 * s)},1
Style: EndTitle,Inter ExtraBold,${Math.round(64 * s)},&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,0,0,5,${Math.round(40 * s)},${Math.round(40 * s)},0,1
Style: EndCta,Inter ExtraBold,${Math.round(36 * s)},&H00000000,&H00000000,&H00FFFFFF,&H00FFFFFF,0,0,0,0,100,100,0,0,3,${Math.round(16 * s)},0,2,${Math.round(40 * s)},${Math.round(40 * s)},${Math.round(260 * s)},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;
  const ev: string[] = [];
  const capEnd = o.endCard ? o.endCard.start : o.duration;
  const yBold = Math.round(o.height * 0.66);
  for (const c of o.chunks) {
    if (c.start >= capEnd) break;
    const end = Math.min(c.end, capEnd);
    if (o.style === "bold") {
      // pop-in: scale 80% → 100% over 120ms
      ev.push(`Dialogue: 1,${ts(c.start)},${ts(end)},Bold,,0,0,0,,{\\pos(${o.width / 2},${yBold})\\fscx80\\fscy80\\t(0,120,\\fscx100\\fscy100)}${esc(c.text.toUpperCase())}`);
    } else if (o.style === "clean") {
      ev.push(`Dialogue: 1,${ts(c.start)},${ts(end)},Clean,,0,0,0,,${esc(c.text)}`);
    }
  }
  if (o.onScreenHook && o.hookEnd) ev.push(`Dialogue: 2,${ts(0)},${ts(o.hookEnd)},Hook,,0,0,0,,${esc(o.onScreenHook)}`);
  if (o.aiLabel) ev.push(`Dialogue: 3,${ts(0)},${ts(o.duration)},Tag,,0,0,0,,AI-generated`);
  if (o.endCard) {
    const { start, title, cta } = o.endCard;
    ev.push(`Dialogue: 4,${ts(start)},${ts(o.duration)},EndTitle,,0,0,0,,{\\fad(200,0)}${esc(title)}`);
    ev.push(`Dialogue: 4,${ts(start + 0.15)},${ts(o.duration)},EndCta,,0,0,0,,{\\fad(200,0)}${esc(cta)}`);
  }
  return header + ev.join("\n") + "\n";
}
