// Moderation (BUILD_PLAN §7). Two layers:
//  1. Local hard rules that always run — NSFW, minors, real public figures, trademarked characters.
//     OpenAI moderation doesn't cover public figures or IP, so these lists matter even with a key.
//  2. OpenAI omni-moderation (text + images) when OPENAI_API_KEY is set.
import { env } from "@/lib/env";

/** Shown next to the upload checkbox and stored in consent_log for every upload. */
export const CONSENT_STATEMENT =
  "I own this image. Anyone shown in it is me or has given consent, and no one shown is under 18.";

export interface ModerationResult {
  allowed: boolean;
  reasons: string[];
  source: "local" | "openai";
}

const words = (list: string[]) => new RegExp(`\\b(?:${list.join("|")})\\b`, "i");

const NSFW = words([
  "nsfw", "nude", "nudes", "nudity", "naked", "topless", "bottomless", "porn\\w*", "sex", "sexual\\w*", "sexy",
  "erotic\\w*", "explicit", "lingerie", "boobs?", "breasts?", "nipples?", "genitals?", "penis", "vagina",
  "onlyfans", "hentai", "fetish\\w*", "bdsm", "orgasm\\w*", "strip(?:per|ping|tease)", "undress\\w*", "seductive\\w*",
]);

// Zero tolerance: anything sexualising minors, plus terms that are only ever used that way.
const MINOR_ALWAYS = words(["loli", "lolicon", "shota\\w*", "underage", "jailbait", "cp", "preteen"]);
const MINOR = words([
  "child", "children", "kid", "kids", "minor", "minors", "teen", "teens", "teenager\\w*", "toddler\\w*", "baby",
  "babies", "infant\\w*", "schoolgirl\\w*", "schoolboy\\w*", "young girl", "little girl", "little boy",
  "\\d{1,2}[- ]?(?:yo|year[- ]old)",
]);
const SUGGESTIVE = words(["bikini", "swimsuit", "bed", "bath", "shower", "kiss\\w*", "romantic", "lingerie", "pose\\w*", "body"]);

// Identifiable public figures — deepfake risk (#1 legal/payment-processor risk). Extend as needed.
export const PUBLIC_FIGURES = [
  "donald trump", "trump", "joe biden", "biden", "kamala harris", "barack obama", "obama", "elon musk", "musk",
  "mark zuckerberg", "zuckerberg", "jeff bezos", "bill gates", "taylor swift", "beyonce", "beyoncé", "rihanna",
  "kim kardashian", "kardashian", "kylie jenner", "selena gomez", "ariana grande", "billie eilish", "drake",
  "kanye west", "kanye", "travis scott", "bad bunny", "shakira", "jennifer lopez", "j\\.?lo", "dua lipa",
  "justin bieber", "lady gaga", "cristiano ronaldo", "ronaldo", "lionel messi", "messi", "lebron james",
  "michael jordan", "tom cruise", "brad pitt", "angelina jolie", "leonardo dicaprio", "dicaprio", "scarlett johansson",
  "emma watson", "zendaya", "dwayne johnson", "the rock", "keanu reeves", "will smith", "oprah", "mrbeast",
  "mr beast", "pope francis", "pope leo", "king charles", "prince harry", "meghan markle", "vladimir putin", "putin",
  "xi jinping", "volodymyr zelensky", "zelensky", "narendra modi", "emmanuel macron", "taylor lautner",
  "sabrina carpenter", "olivia rodrigo", "snoop dogg", "eminem", "jay-z", "nicki minaj", "cardi b", "doja cat",
];
const FIGURES = words(PUBLIC_FIGURES.map((n) => n.replace(/ /g, "\\s+")));

// Trademarked / copyrighted characters and brands we never generate in presets or prompts.
export const PROTECTED_IP = [
  "mickey mouse", "minnie mouse", "donald duck", "disney", "pixar", "marvel", "spider-?man", "iron ?man", "batman",
  "superman", "wonder woman", "joker", "hulk", "captain america", "thor", "deadpool", "wolverine", "avengers",
  "star wars", "darth vader", "yoda", "baby yoda", "grogu", "pikachu", "pokemon", "pokémon", "mario", "luigi",
  "nintendo", "zelda", "sonic the hedgehog", "hello kitty", "elsa", "frozen", "shrek", "minions?", "barbie",
  "harry potter", "hogwarts", "simpsons", "spongebob", "peppa pig", "paw patrol", "bluey", "naruto", "goku",
  "dragon ball", "one piece", "transformers", "lego", "fortnite", "minecraft", "roblox", "james bond",
];
const IP = words(PROTECTED_IP.map((n) => n.replace(/ /g, "\\s+")));

export function moderateTextLocal(text: string): ModerationResult {
  const t = text.normalize("NFKC");
  const reasons: string[] = [];
  if (MINOR_ALWAYS.test(t)) reasons.push("minors");
  if (MINOR.test(t) && (NSFW.test(t) || SUGGESTIVE.test(t))) reasons.push("minors");
  if (NSFW.test(t)) reasons.push("sexual");
  if (FIGURES.test(t)) reasons.push("public_figure");
  if (IP.test(t)) reasons.push("protected_ip");
  return { allowed: reasons.length === 0, reasons: [...new Set(reasons)], source: "local" };
}

type OpenAIInput = { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } };

async function openaiModerate(input: OpenAIInput[]): Promise<ModerationResult | null> {
  if (!env.openaiKey()) return null;
  try {
    const res = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.openaiKey()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "omni-moderation-latest", input }),
    });
    if (!res.ok) throw new Error(`openai moderation ${res.status}`);
    const data = (await res.json()) as {
      results: { flagged: boolean; categories: Record<string, boolean>; category_scores: Record<string, number> }[];
    };
    const reasons = new Set<string>();
    for (const r of data.results) {
      for (const [cat, hit] of Object.entries(r.categories)) if (hit) reasons.add(cat);
      // Stricter than OpenAI's defaults for anything sexual — Stripe will drop us otherwise.
      if ((r.category_scores["sexual"] ?? 0) > 0.3) reasons.add("sexual");
      if ((r.category_scores["sexual/minors"] ?? 0) > 0.05) reasons.add("sexual/minors");
    }
    return { allowed: reasons.size === 0, reasons: [...reasons], source: "openai" };
  } catch (e) {
    // Fail closed for images, open (local rules still applied) for text.
    console.error("[moderation] OpenAI call failed:", (e as Error).message);
    return { allowed: input.every((i) => i.type === "text"), reasons: ["moderation_unavailable"], source: "openai" };
  }
}

export async function moderateText(text: string): Promise<ModerationResult> {
  const local = moderateTextLocal(text);
  if (!local.allowed) return local;
  return (await openaiModerate([{ type: "text", text }])) ?? local;
}

/** Image check at upload time. `dataUrl` = data:image/...;base64,... */
export async function moderateImage(dataUrl: string): Promise<ModerationResult> {
  return (await openaiModerate([{ type: "image_url", image_url: { url: dataUrl } }])) ?? {
    allowed: true,
    reasons: [],
    source: "local",
  };
}

export function moderationMessage(reasons: string[]): string {
  if (reasons.includes("minors") || reasons.includes("sexual/minors"))
    return "This request involves minors in a way we never allow.";
  if (reasons.includes("public_figure"))
    return "We don't generate real public figures. Use your own photo (with consent) or a fictional person.";
  if (reasons.includes("protected_ip")) return "We can't generate trademarked characters or brands.";
  if (reasons.some((r) => r.startsWith("sexual"))) return "Sexual or explicit content isn't allowed.";
  if (reasons.includes("moderation_unavailable")) return "Our safety check is temporarily unavailable. Try again shortly.";
  return "This request goes against our Acceptable Use Policy.";
}
