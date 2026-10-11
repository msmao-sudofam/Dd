import Link from "next/link";
import type { PresetCard } from "@/lib/presets";

export function PresetTile({ preset }: { preset: PresetCard }) {
  return (
    <Link
      href={`/presets/${preset.slug}`}
      className="group relative block overflow-hidden rounded-2xl border border-border bg-surface"
      data-testid={`preset-${preset.slug}`}
    >
      <div className="relative aspect-[9/16]">
        {preset.preview_video_url ? (
          <video
            src={preset.preview_video_url}
            poster={preset.thumbnail_url ?? undefined}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
        ) : (
          <div className="h-full w-full bg-surface-2" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-3">
          <div className="text-sm font-bold leading-tight">{preset.name}</div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-white/70">
            <span>{preset.requires_image ? "1 photo" : "Text only"}</span>
            <span className="rounded-full bg-black/50 px-2 py-0.5 text-accent">{preset.credits} cr</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
