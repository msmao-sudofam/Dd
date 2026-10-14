import Link from "next/link";
import { WallGovernor } from "@/components/landing/wall-governor";
import type { PresetCard } from "@/lib/presets";

const ROWS = 3;
const COPIES = 4; // the row slides by one copy (-25%), so three more must cover the widest screen

/** Seeded previews have a 288px twin for the wall (public/presets/sm); admin-uploaded ones play as they are. */
function wallSrc(p: PresetCard): string {
  return p.preview_video_url === `/presets/${p.slug}.mp4` ? `/presets/sm/${p.slug}.mp4` : p.preview_video_url!;
}

/**
 * Every preset clip drifting across a tilted plane. Decorative: the catalog below is the accessible list.
 * <WallGovernor/> loads and plays the clips, a few at a time.
 */
export function ClipWall({ presets }: { presets: PresetCard[] }) {
  const clips = presets.filter((p) => p.preview_video_url);
  if (clips.length < ROWS * 3) return null;
  const rows = Array.from({ length: ROWS }, (_, r) => clips.filter((_, i) => i % ROWS === r));
  return (
    <div className="wall h-[430px] sm:h-[620px]" aria-hidden data-testid="clip-wall">
      <WallGovernor />
      <div className="wall-plane flex h-full flex-col justify-center gap-3">
        {rows.map((row, r) => (
          <div
            key={r}
            className={`wall-row ${r === 2 ? "hidden sm:flex" : ""}`}
            data-rev={r % 2 === 1 ? "" : undefined}
            style={{ "--dur": `${[84, 104, 92][r]}s` } as React.CSSProperties}
          >
            {Array.from({ length: COPIES }, (_, c) =>
              row.map((p) => (
                <Link
                  key={`${c}-${p.id}`}
                  href={`/presets/${p.slug}`}
                  tabIndex={-1}
                  className="relative mr-3 block aspect-[9/16] w-[118px] shrink-0 overflow-hidden rounded-[10px] bg-surface sm:w-[156px]"
                >
                  <video data-src={wallSrc(p)} poster={p.thumbnail_url ?? undefined} className="h-full w-full object-cover" muted loop playsInline preload="none" />
                </Link>
              )),
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
