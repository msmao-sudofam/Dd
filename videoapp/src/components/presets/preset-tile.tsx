import Link from "next/link";
import { LazyVideo } from "@/components/lazy-video";
import type { PresetCard } from "@/lib/presets";

/** Morphic "content thumbnail card": 10px radius, media first, overlaid title + black pill. */
export function PresetTile({ preset, className = "" }: { preset: PresetCard; className?: string }) {
  return (
    <Link
      href={`/presets/${preset.slug}`}
      className={`tilt group relative block overflow-hidden rounded-[10px] bg-surface ring-1 ring-white/5 transition-shadow duration-500 hover:shadow-[0_24px_60px_rgba(0,0,0,0.7)] hover:ring-white/25 ${className}`}
      data-testid={`preset-${preset.slug}`}
      data-tilt
    >
      <div className="relative aspect-[9/16]">
        {preset.preview_video_url ? (
          <LazyVideo
            src={preset.preview_video_url}
            poster={preset.thumbnail_url ?? undefined}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <span className="glare" aria-hidden />
        <span className="pill absolute top-2.5 right-2.5">{preset.credits} cr</span>
        <div className="absolute inset-x-0 bottom-0 p-3">
          <div className="text-[15px] font-semibold leading-tight tracking-[-0.02em]">{preset.name}</div>
          <div className="mt-0.5 flex items-center justify-between text-xs text-white/60">
            <span>{preset.requires_image ? "1 photo" : "Text only"}</span>
            <span className="translate-x-1 opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100" aria-hidden>Try it →</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
