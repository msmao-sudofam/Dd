import type { PresetCard } from "@/lib/presets";

/** Three columns of autoplaying 9:16 previews scrolling past each other. */
export function VideoWall({ presets }: { presets: PresetCard[] }) {
  const withVideo = presets.filter((p) => p.preview_video_url);
  const cols = [0, 1, 2].map((c) => withVideo.filter((_, i) => i % 3 === c));
  return (
    <div
      className="relative h-[560px] overflow-hidden rounded-3xl [mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)]"
      aria-hidden
      data-testid="video-wall"
    >
      <div className="grid h-full grid-cols-3 gap-3">
        {cols.map((col, c) => (
          <div key={c} className={`wall-col flex flex-col gap-3 ${c === 1 ? "reverse slow" : ""}`}>
            {[...col, ...col].map((p, i) => (
              <div key={`${p.id}-${i}`} className="relative aspect-[9/16] overflow-hidden rounded-2xl border border-border bg-surface">
                <video
                  src={p.preview_video_url!}
                  poster={p.thumbnail_url ?? undefined}
                  className="h-full w-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
                <span className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold">{p.name}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
