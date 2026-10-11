import Link from "next/link";
import { LazyVideo } from "@/components/lazy-video";
import type { PresetCard } from "@/lib/presets";

/** Morphic "content thumbnail card": 10px radius, media first, overlaid title + black pill. */
export function PresetTile({ preset, className = "" }: { preset: PresetCard; className?: string }) {
  return (
    <Link
      href={`/presets/${preset.slug}`}
      className={`group relative block overflow-hidden rounded-[10px] bg-surface ${className}`}
      data-testid={`preset-${preset.slug}`}
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
        <span className="pill absolute top-2.5 right-2.5">{preset.credits} cr</span>
        <div className="absolute inset-x-0 bottom-0 p-3">
          <div className="text-[15px] font-semibold leading-tight tracking-[-0.02em]">{preset.name}</div>
          <div className="mt-0.5 text-xs text-white/60">{preset.requires_image ? "1 photo" : "Text only"}</div>
        </div>
      </div>
    </Link>
  );
}
