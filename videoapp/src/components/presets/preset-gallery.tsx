"use client";

import { useState, type ReactNode } from "react";
import type { PresetCategory } from "@/lib/types";

/** Category tabs over server-rendered tiles (tiles stay server components for fast first paint). */
export function PresetGallery({
  categories,
  items,
}: {
  categories: { id: PresetCategory; label: string }[];
  items: { category: PresetCategory; featured: boolean; node: ReactNode; key: string }[];
}) {
  const [active, setActive] = useState<PresetCategory | "featured" | "all">("all");
  const shown = items.filter((i) => active === "all" || (active === "featured" ? i.featured : i.category === active));
  const tabs: { id: typeof active; label: string }[] = [{ id: "all", label: "All" }, { id: "featured", label: "Trending" }, ...categories];
  return (
    <div>
      <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={active === t.id}
            onClick={() => setActive(t.id)}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-sm transition ${active === t.id ? "border-accent bg-accent text-accent-ink" : "border-border text-muted hover:text-foreground"}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {shown.map((i) => (
          <div key={i.key}>{i.node}</div>
        ))}
      </div>
    </div>
  );
}
