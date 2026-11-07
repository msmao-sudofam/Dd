// The free "ad frame" looks a visitor can try before signing up. Each one maps to the preset that then animates it.
// Safe to import from client components (no server code here).

export interface TryLook {
  id: string;
  label: string;
  /** preset that turns this frame into a clip after sign-up */
  presetSlug: string;
  /** instruction for the image-edit model; the product photo is the only reference image */
  prompt: string;
}

const KEEP =
  "Keep the product from the reference photo exactly as it is: same shape, proportions, colours, materials and any label or text on it. " +
  "Do not add text, logos, watermarks, people or extra products. Photorealistic vertical 9:16 advertising photograph.";

export const TRY_LOOKS: TryLook[] = [
  {
    id: "studio",
    label: "Studio hero",
    presetSlug: "hero-shot",
    prompt: `Place the product on a dark stone pedestal against a deep charcoal gradient background, with a thin rim light from behind, faint dust in the air and a soft reflection under it. Premium, moody commercial look. ${KEEP}`,
  },
  {
    id: "lifestyle",
    label: "Sunlit home",
    presetSlug: "lifestyle-scene",
    prompt: `Place the product naturally on a light wooden surface in a bright modern home, morning sunlight through a window with sheer curtains, a small green plant softly blurred behind it. Authentic lifestyle look. ${KEEP}`,
  },
  {
    id: "splash",
    label: "Water splash",
    presetSlug: "liquid-splash",
    prompt: `Show the product standing in a crown-shaped splash of clear water with droplets frozen in the air around it, black background, glossy highlights and dramatic side lighting. High-speed commercial photography. ${KEEP}`,
  },
];

export const lookById = (id: string | null | undefined) => TRY_LOOKS.find((l) => l.id === id) ?? null;

/** What the browser is allowed to know about a try session. */
export interface TryView {
  name: string;
  /** short form for headlines; falls back to "your product" when the name is long or missing */
  shortName: string;
  photoUrl: string;
  look: string | null;
  still: { status: "none" | "running" | "succeeded" | "failed"; url: string | null };
  stillsLeft: number;
  /** true when the still came from the built-in sample provider instead of a real model */
  sample: boolean;
  /** where "make it move" should go: the preset of the last look, or the default one */
  presetSlug: string;
}
