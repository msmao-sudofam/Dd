import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { env } from "@/lib/env";
import { CATEGORIES, getPresetCard, listPresetCards } from "@/lib/presets";
import { PresetRunner } from "@/components/presets/preset-runner";
import { PresetTile } from "@/components/presets/preset-tile";
import { lookById } from "@/lib/try/looks";
import { currentTryView } from "@/lib/try/session";

export async function generateMetadata({ params }: PageProps<"/presets/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPresetCard(slug);
  if (!p) return {};
  const title = `${p.name} AI video preset`;
  const description = `${p.description} Upload one photo and get a 9:16 ${p.name.toLowerCase()} video for TikTok, Reels and Shorts.`;
  return {
    title,
    description,
    alternates: { canonical: `/presets/${p.slug}` },
    openGraph: {
      title,
      description,
      type: "video.other",
      videos: p.preview_video_url ? [{ url: p.preview_video_url }] : undefined,
      images: p.thumbnail_url ? [{ url: p.thumbnail_url }] : undefined,
    },
  };
}

export default async function PresetPage({ params }: PageProps<"/presets/[slug]">) {
  const { slug } = await params;
  const [preset, profile, all, mine] = await Promise.all([getPresetCard(slug), getCurrentProfile(), listPresetCards(), currentTryView()]);
  if (!preset) notFound();
  // The photo a visitor previewed before signing up: offered here so one click starts the clip.
  const carried =
    mine && preset.requires_image
      ? {
          name: mine.name,
          previewUrl: (lookById(mine.look)?.presetSlug === preset.slug && mine.still.url) || mine.photoUrl,
        }
      : null;
  const category = CATEGORIES.find((c) => c.id === preset.category);
  const related = all.filter((p) => p.category === preset.category && p.slug !== preset.slug).slice(0, 5);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: `${preset.name} — ${env.brandName()} preset`,
    description: preset.description,
    thumbnailUrl: preset.thumbnail_url ? `${env.appUrl()}${preset.thumbnail_url}` : undefined,
    contentUrl: preset.preview_video_url ? `${env.appUrl()}${preset.preview_video_url}` : undefined,
    uploadDate: "2026-10-11",
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="mb-6 text-sm text-muted">
        <Link href="/presets" className="hover:text-foreground">Presets</Link> / {category?.label}
      </nav>
      <div className="grid gap-10 md:grid-cols-[minmax(0,360px)_1fr]">
        <div className="mx-auto w-full max-w-[260px] overflow-hidden rounded-[32px] border border-border md:max-w-none">
          {preset.preview_video_url && (
            <video src={preset.preview_video_url} poster={preset.thumbnail_url ?? undefined} className="aspect-[9/16] w-full object-cover" autoPlay muted loop playsInline />
          )}
        </div>
        <div>
          <h1 className="display text-[clamp(40px,6vw,72px)]">{preset.name}</h1>
          <p className="mt-3 text-lg text-muted">{preset.description}</p>
          <ul className="mt-5 flex flex-wrap gap-2 text-xs text-muted">
            <li className="rounded-full bg-ghost px-3 py-1 text-soft">9:16 vertical</li>
            <li className="rounded-full bg-ghost px-3 py-1 text-soft">{preset.requires_image ? "Upload 1 photo" : "No photo needed"}</li>
            <li className="rounded-full bg-ghost px-3 py-1 text-soft">{preset.credits} credits</li>
            <li className="rounded-full bg-ghost px-3 py-1 text-soft">Model: {preset.modelName}</li>
          </ul>
          <div className="card mt-8 rounded-[20px] p-5">
            {profile ? (
              <PresetRunner
                presetId={preset.id}
                presetSlug={preset.slug}
                carried={carried}
                credits={preset.credits}
                requiresImage={preset.requires_image}
                requiresSubject={preset.requires_subject}
                balance={profile.credits_balance}
              />
            ) : (
              <div className="text-center">
                <p className="mb-4 text-sm text-muted">
                  {carried ? "Sign up free and your photo comes with you. Your welcome credits cover a Fast clip." : "Sign up free — your welcome credits cover your first clip."}
                </p>
                <Link href={`/signup?next=/presets/${preset.slug}`} className="btn-primary w-full">Try {preset.name} free</Link>
              </div>
            )}
          </div>
          <div className="mt-8 space-y-2 text-sm text-muted">
            <h2 className="text-base font-bold text-foreground">How it works</h2>
            <p>1. {preset.requires_image ? "Upload a clear photo of your product (or yourself)." : "Describe your product in a few words."}</p>
            <p>2. We apply the {preset.name} look with tuned camera motion, lighting and pacing.</p>
            <p>3. Download a vertical clip ready for TikTok, Reels and Shorts.</p>
          </div>
        </div>
      </div>
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-5 text-xl font-semibold tracking-[-0.02em]">More {category?.label}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {related.map((p) => <PresetTile key={p.id} preset={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
