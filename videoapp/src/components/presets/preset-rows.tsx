import Link from "next/link";
import { PresetTile } from "./preset-tile";
import type { PresetCard } from "@/lib/presets";
import type { PresetCategory } from "@/lib/types";

/** Category rows: narrow title column + horizontal strip of 9:16 clips (Runway Watch pattern). */
export function PresetRows({
  categories,
  presets,
}: {
  categories: { id: PresetCategory; label: string; blurb?: string }[];
  presets: PresetCard[];
}) {
  return (
    <div className="space-y-14">
      {categories.map((c) => {
        const items = presets.filter((p) => p.category === c.id);
        if (!items.length) return null;
        return (
          <div key={c.id} className="grid gap-5 md:grid-cols-[200px_minmax(0,1fr)]" data-reveal>
            <div className="flex items-baseline justify-between gap-4 md:block">
              <h3 className="text-xl font-semibold tracking-[-0.02em]">{c.label}</h3>
              {c.blurb && <p className="mt-1.5 hidden text-sm text-muted md:block">{c.blurb}</p>}
              <Link href={`/presets?c=${c.id}`} className="text-sm text-muted hover:text-foreground md:mt-4 md:inline-block">
                {items.length} presets →
              </Link>
            </div>
            <div className="no-scrollbar -mx-4 -my-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 py-4 md:-mx-3 md:px-3">
              {items.map((p) => (
                <PresetTile key={p.id} preset={p} className="w-[44vw] shrink-0 snap-start sm:w-[200px]" />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
