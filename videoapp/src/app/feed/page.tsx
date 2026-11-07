import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth";
import { Feed } from "@/components/feed/feed";
import { listPresetCards } from "@/lib/presets";
import { currentTryView } from "@/lib/try/session";

export const metadata: Metadata = {
  title: "The feed",
  description: "Swipe through every preset as a full-screen clip, then make the one you like with your own product.",
  alternates: { canonical: "/feed" },
};

export default async function FeedPage() {
  const [cards, user, mine] = await Promise.all([listPresetCards(), getSessionUser(), currentTryView()]);
  const clips = cards.filter((c) => c.preview_video_url);
  const hrefFor = Object.fromEntries(
    clips.map((c) => [c.slug, user ? `/presets/${c.slug}` : `/signup?next=${encodeURIComponent(`/presets/${c.slug}`)}`]),
  );
  return (
    <div className="sm:py-4">
      <h1 className="sr-only">Preset feed</h1>
      <Feed presets={clips} hrefFor={hrefFor} cta={mine ? `Make this with ${mine.shortName}` : "Make this with my product"} />
    </div>
  );
}
