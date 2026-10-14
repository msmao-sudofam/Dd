"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { PresetTile } from "./preset-tile";
import type { PresetCard } from "@/lib/presets";
import type { PresetCategory } from "@/lib/types";

type Cat = { id: PresetCategory; label: string; blurb?: string };

/**
 * Landing-page preset showcase: filter chips over one strip that runs to the screen edge (fal's quick chips +
 * Runway Watch strip). Every tile stays in the DOM and is hidden with `hidden` when filtered out, so the page
 * always carries all presets (tests and crawlers see the full catalog).
 */
export function PresetShowcase({ categories, presets, photoLabel }: { categories: Cat[]; presets: PresetCard[]; photoLabel?: string }) {
  const [active, setActive] = useState<PresetCategory | "all">("all");
  const strip = useRef<HTMLDivElement>(null);
  const cats = categories.filter((c) => presets.some((p) => p.category === c.id));
  const current = cats.find((c) => c.id === active);
  const count = active === "all" ? presets.length : presets.filter((p) => p.category === active).length;

  const pick = (id: PresetCategory | "all") => {
    setActive(id);
    strip.current?.scrollTo({ left: 0 });
  };

  const chip = (id: PresetCategory | "all", label: string) => (
    <button
      key={id}
      type="button"
      role="tab"
      aria-selected={active === id}
      onClick={() => pick(id)}
      className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${active === id ? "bg-white text-black" : "bg-ghost text-soft hover:bg-surface-2"}`}
    >
      {label}
    </button>
  );

  return (
    <div>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4" role="tablist" aria-label="Preset categories">
        {chip("all", `All ${presets.length}`)}
        {cats.map((c) => chip(c.id, c.label))}
      </div>
      <div className="mt-5 flex min-h-6 items-baseline justify-between gap-4 text-sm">
        <p className="text-muted">{current?.blurb ?? "Every look, ready to run on one product photo."}</p>
        <Link href={active === "all" ? "/presets" : `/presets?c=${active}`} className="shrink-0 text-muted transition hover:text-foreground">
          {count} presets →
        </Link>
      </div>
      <div
        ref={strip}
        className="no-scrollbar strip-bleed -mx-4 mt-3 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 py-4 md:-mx-3 md:scroll-px-3 md:px-3"
        role="tabpanel"
        aria-label={current?.label ?? "All presets"}
      >
        {presets.map((p) => (
          <PresetTile
            key={p.id}
            preset={p}
            photoLabel={photoLabel}
            className={`w-[44vw] shrink-0 snap-start sm:w-[220px] ${active === "all" || p.category === active ? "" : "hidden"}`}
          />
        ))}
      </div>
    </div>
  );
}
