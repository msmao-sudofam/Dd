import { CreatorMedia } from "@/components/ugc/creator-media";
import type { UgcActor } from "@/lib/types";

/** Five library creators as a fanned hand of phone cards that spreads on hover (styles: `.fan` in globals.css). */
export function CreatorFan({ actors }: { actors: UgcActor[] }) {
  const cast = actors.filter((a) => a.portrait_url).slice(0, 5);
  if (cast.length < 3) return null;
  const mid = (cast.length - 1) / 2;
  return (
    <div className="fan mx-auto h-[300px] w-[300px] sm:h-[340px] sm:w-[380px]" aria-label="AI creators from the library">
      {cast.map((a, i) => (
        <figure
          key={a.id}
          className="aspect-[9/16] w-[132px] overflow-hidden rounded-[18px] bg-surface shadow-[0_18px_50px_rgba(0,0,0,0.65)] ring-1 ring-white/15 sm:w-[158px]"
          style={{ "--i": i - mid, zIndex: 10 - Math.abs(i - mid) } as React.CSSProperties}
        >
          <div className="h-full w-full transition duration-500" style={{ filter: `brightness(${1 - Math.abs(i - mid) * 0.14})` }}>
            <CreatorMedia actor={a} className="h-full w-full object-cover" />
          </div>
          <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-3 pt-8 pb-2.5">
            <span className="block text-[13px] font-semibold tracking-[-0.02em]">{a.name}</span>
            <span className="block truncate text-[10px] text-white/65">{a.vibe}</span>
          </figcaption>
          <span className="absolute top-2 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[8px] font-semibold">AI-generated</span>
        </figure>
      ))}
    </div>
  );
}
