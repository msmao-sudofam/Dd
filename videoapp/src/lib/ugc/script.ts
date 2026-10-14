import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod/v4";
import type { UgcScript } from "@/lib/types";
import { MAX_SCRIPT_WORDS, scriptText } from "./config";

export interface ProductBrief {
  name: string;
  description: string;
  benefits: string[];
  audience: string;
  offer: string;
  tone: "friendly" | "hype" | "calm" | "funny";
}

export const ANGLES = [
  { id: "problem-solution", label: "Problem → solution" },
  { id: "first-impressions", label: "First impressions" },
  { id: "three-reasons", label: "3 reasons" },
  { id: "pov", label: "POV" },
  { id: "us-vs-them", label: "Old way vs new way" },
  { id: "routine", label: "In my routine" },
] as const;

const ScriptSchema = z.object({
  scripts: z.array(
    z.object({
      angle: z.string(),
      hook: z.string(),
      body: z.array(z.string()),
      cta: z.string(),
      on_screen_hook: z.string(),
    }),
  ),
});

const SYSTEM = `You write short-form UGC video ad scripts that small brands run on TikTok, Instagram Reels and YouTube Shorts.
The script is spoken to camera by an AI-generated creator holding the product.

Rules:
- First line (hook) stops the scroll in 10 words or fewer. No "Hey guys".
- Total spoken length 45-90 words (about 18-35 seconds). Conversational, contractions, short sentences.
- Speak about the product honestly from what the brand told you. Never invent personal results, usage time
  ("I've used this for 3 months"), statistics, awards, reviews, medical, health, weight-loss or financial claims.
- No competitor brand names, celebrities, or trademarked characters.
- "cta" is one line telling viewers what to do, using the offer if there is one.
- "on_screen_hook" is 3-6 words of text shown on screen during the hook.
- Each script uses a different angle from the list you're given. Keep the angle id exactly as given.`;

/** Claude path (ANTHROPIC_API_KEY or an `ant` profile). Returns null if unavailable or refused. */
async function claudeScripts(brief: ProductBrief, angles: string[]): Promise<UgcScript[] | null> {
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) return null;
  try {
    const client = new Anthropic();
    const response = await client.beta.messages.parse({
      model: "claude-opus-5-5",
      max_tokens: 16000,
      // Server-side refusal fallback: routes a declined request to another model inside the same call.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "medium", format: zodOutputFormat(ScriptSchema) },
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: `Product: ${brief.name}
What it is: ${brief.description || "(not given)"}
Key benefits: ${brief.benefits.filter(Boolean).join("; ") || "(not given)"}
Audience: ${brief.audience || "(not given)"}
Offer: ${brief.offer || "(none)"}
Tone: ${brief.tone}

Write ${angles.length} scripts, one per angle, in this order: ${angles.join(", ")}.`,
        },
      ],
    } as Parameters<typeof client.beta.messages.parse>[0]);
    if (response.stop_reason === "refusal" || !response.parsed_output) return null;
    const out = (response.parsed_output as z.infer<typeof ScriptSchema>).scripts;
    return out.length ? out : null;
  } catch (e) {
    console.error("[ugc/script] Claude unavailable, using templates:", (e as Error).message);
    return null;
  }
}

// --- Template writer: deterministic, no API needed (also the fallback) -----------------------------

const pick = <T,>(arr: T[], seed: number) => arr[Math.abs(seed) % arr.length];
const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7);
const sentence = (s: string) => {
  const t = s.trim().replace(/\s+/g, " ");
  if (!t) return t;
  const c = t[0].toUpperCase() + t.slice(1);
  return /[.!?]$/.test(c) ? c : `${c}.`;
};

export function templateScript(brief: ProductBrief, angle: string, variant = 0): UgcScript {
  const name = brief.name.trim();
  const b = brief.benefits.map((x) => x.trim()).filter(Boolean);
  const b1 = b[0] ?? brief.description.trim() ?? `it just works`;
  const b2 = b[1] ?? "it fits right into my day";
  const b3 = b[2] ?? "it actually looks good on the shelf";
  const who = brief.audience.trim() || "anyone who's busy";
  const cta = brief.offer.trim() ? `Tap the link — ${brief.offer.trim()}.` : `Tap the link and grab your ${name}.`;
  const s = hash(`${name}${angle}${variant}`);
  const energy = brief.tone === "hype" ? "Okay, " : brief.tone === "funny" ? "Not me being dramatic, but " : "";

  switch (angle) {
    case "problem-solution":
      return {
        angle,
        hook: pick([`If this sounds like you, stop scrolling.`, `This fixed my biggest annoyance.`, `I was so done with this problem.`], s),
        body: [sentence(`${energy}if you're ${who}, you know the struggle`), sentence(`That's exactly why ${name} exists — ${b1}`), sentence(`Plus, ${b2}`)],
        cta,
        on_screen_hook: "This fixed it",
      };
    case "first-impressions":
      return {
        angle,
        hook: pick([`Okay, first impressions of ${name}.`, `Let's open this together.`, `I wasn't expecting this.`], s),
        body: [sentence(`${energy}right away I noticed ${b1}`), sentence(`And ${b2}`), sentence(`Honestly? ${b3}`)],
        cta,
        on_screen_hook: "First impressions",
      };
    case "three-reasons":
      return {
        angle,
        hook: `Three reasons I keep reaching for this.`,
        body: [sentence(`One: ${b1}`), sentence(`Two: ${b2}`), sentence(`Three: ${b3}`)],
        cta,
        on_screen_hook: "3 reasons",
      };
    case "pov":
      return {
        angle,
        hook: pick([`POV: you finally found the one.`, `POV: your new favorite thing.`], s),
        body: [sentence(`${energy}this is ${name}`), sentence(`It's made for ${who} — ${b1}`), sentence(`And ${b2}`)],
        cta,
        on_screen_hook: "POV: found it",
      };
    case "us-vs-them":
      return {
        angle,
        hook: `The old way versus the ${name} way.`,
        body: [sentence(`The old way? Complicated, and it never quite worked`), sentence(`The new way: ${b1}`), sentence(`Plus ${b2}`)],
        cta,
        on_screen_hook: "Old way vs new way",
      };
    default:
      return {
        angle: "routine",
        hook: pick([`Here's where this fits in my routine.`, `My daily non-negotiable, explained.`], s),
        body: [sentence(`${energy}every day I reach for ${name}`), sentence(`Why? ${b1}`), sentence(`And honestly, ${b2}`)],
        cta,
        on_screen_hook: "In my routine",
      };
  }
}

/** Trim overlong scripts so they stay within the spoken-length budget. */
function clamp(s: UgcScript): UgcScript {
  const body = [...s.body];
  while (body.length > 1 && scriptText({ ...s, body }).split(/\s+/).length > MAX_SCRIPT_WORDS) body.pop();
  return { ...s, body };
}

export async function writeScripts(brief: ProductBrief, count: number): Promise<{ scripts: UgcScript[]; source: "claude" | "template" }> {
  const angles = ANGLES.slice(0, Math.min(Math.max(count, 1), ANGLES.length)).map((a) => a.id);
  const ai = await claudeScripts(brief, angles);
  if (ai) return { scripts: ai.map(clamp), source: "claude" };
  return { scripts: angles.map((a, i) => clamp(templateScript(brief, a, i))), source: "template" };
}
