import Link from "next/link";
import { PresetGallery } from "@/components/presets/preset-gallery";
import { PresetTile } from "@/components/presets/preset-tile";
import { env } from "@/lib/env";
import { CATEGORIES, listPresetCards } from "@/lib/presets";

export default async function Home() {
  const cards = await listPresetCards();
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pt-16 pb-10">
        <h1 className="max-w-3xl text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl">
          One product photo in.<br /><span className="text-accent">A scroll-stopping ad out.</span>
        </h1>
        <p className="mt-5 max-w-xl text-lg text-muted">
          {env.brandName()} turns a single photo into 9:16 video ads with one-click presets — 360 spins, crash zooms, unboxings, UGC and viral effects.
        </p>
        <div className="mt-8 flex gap-3">
          <Link href="/signup" className="btn-primary">Get free credits</Link>
          <Link href="/presets" className="btn-ghost">Browse presets</Link>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 pb-10" id="presets">
        <PresetGallery
          categories={CATEGORIES}
          items={cards.map((c) => ({ key: c.id, category: c.category, featured: c.is_featured, node: <PresetTile preset={c} /> }))}
        />
      </section>
    </>
  );
}
