import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadSpaceMono } from "@remotion/google-fonts/SpaceMono";
import { loadFont as loadLocal } from "@remotion/fonts";
import { staticFile } from "remotion";

// Default: @remotion/google-fonts. Set REMOTION_LOCAL_FONTS=1 to load the same Google
// font files from public/fonts instead (for offline or locked-down machines).
const LOCAL = process.env.REMOTION_LOCAL_FONTS === "1";

const local = (family: string, file: string, weight: string) => {
  loadLocal({ family, url: staticFile(`fonts/${file}`), weight, format: "woff2" });
  return family;
};

export const ANTON = LOCAL
  ? local("Anton", "Anton-400.woff2", "400")
  : loadAnton("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily;
export const INTER = LOCAL
  ? (local("Inter", "Inter-var.woff2", "500"), local("Inter", "Inter-var.woff2", "800"))
  : loadInter("normal", { weights: ["500", "800"], subsets: ["latin"] }).fontFamily;
export const MONO = LOCAL
  ? (local("Space Mono", "SpaceMono-400.woff2", "400"), local("Space Mono", "SpaceMono-700.woff2", "700"))
  : loadSpaceMono("normal", { weights: ["400", "700"], subsets: ["latin"] }).fontFamily;

export const C = {
  cream: "#F3EEE6",
  ink: "#111111",
  red: "#D7192A",
  brightRed: "#E5202F",
  dark: "#0B0809",
};

export const W = 1080;
export const H = 1920;
export const FPS = 30;
/** All text lives between these y values (TikTok UI covers the rest). */
export const SAFE_TOP = 220;
export const SAFE_BOTTOM = 1500;

export const sec = (s: number) => Math.round(s * FPS);

// ---------------------------------------------------------------------------
// EXACT LABEL DATA. Verbatim from the Sí Quema label. Never edit doses here
// without the physical label in hand.
// ---------------------------------------------------------------------------
export const SERVING = "Serving size 1 scoop (4.5 g)";
export const SERVINGS = "30 servings";
export const NET = "135 g net";

export type Ingredient = {
  name: string;
  dose: string;
  /** Plain-English line from the label brief. Lines ending in * need the FDA disclaimer. */
  note: string;
};

export const INGREDIENTS: Ingredient[] = [
  { name: "Caffeine Anhydrous", dose: "200 mg", note: "about two cups of coffee" },
  { name: "N-Acetyl L-Carnitine HCl", dose: "1 g", note: "carnitine, form #1" },
  { name: "L-Carnitine L-Tartrate", dose: "1 g", note: "carnitine, form #2" },
  { name: "L-Tyrosine", dose: "500 mg", note: "mental focus*" },
  { name: "L-Theanine", dose: "350 mg", note: "focus, not jitters*" },
  { name: "Capsimax® Cayenne Ext.", dose: "100 mg", note: "the cayenne kick*" },
  { name: "Gamma-Butyrobetaine HCl", dose: "75 mg", note: "the one that makes you sweat" },
  { name: "AstraGin®", dose: "50 mg", note: "helps absorption*" },
  { name: "Grains of Paradise Ext.", dose: "40 mg", note: "thermogenic spice*" },
];

export const OTHER_INGREDIENTS =
  "natural and artificial flavors, citric acid, malic acid, silicon dioxide, sucralose, acesulfame potassium, beta carotene (color).";

export const FLAVORS = ["MANGO", "WATERMELON", "KIWI STRAWBERRY", "CUCUMBER LIME"];

export const WARNINGS = [
  "Contains 200 mg of caffeine per serving.",
  "Do not combine with other sources of caffeine.",
];

export const FINE_PRINT = "200 mg caffeine per serving · 18+";
export const FDA =
  "*These statements have not been evaluated by the FDA. This product is not intended to diagnose, treat, cure or prevent any disease.";

/** A made-up, generic "proprietary blend" label used as the comparison. Not any real brand. */
export const EXAMPLE_BLEND = {
  label: "example: a typical blend label",
  line: "Thermogenic Blend",
  amount: "1,850 mg†",
  names:
    "Caffeine Anhydrous, Acetyl L-Carnitine, Cayenne Pepper Extract, Green Tea Leaf Extract, Black Pepper Extract",
  dagger: "† Daily Value not established.",
};
