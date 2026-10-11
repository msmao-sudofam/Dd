import { PresetGallery } from "@/components/presets/preset-gallery";
import { PresetTile } from "@/components/presets/preset-tile";
import { CATEGORIES, listPresetCards } from "@/lib/presets";

export const metadata = {
  title: "AI video presets",
  description: "One-click AI video presets: product ads, camera moves, UGC, effects and viral trends. Upload one photo, get a 9:16 clip.",
};

export default async function PresetsPage() {
  const cards = await listPresetCards();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-black tracking-tight">Presets</h1>
      <p className="mt-2 mb-8 text-muted">Pick a look, upload one photo, done.</p>
      <PresetGallery
        categories={CATEGORIES}
        items={cards.map((c) => ({ key: c.id, category: c.category, featured: c.is_featured, node: <PresetTile preset={c} /> }))}
      />
    </div>
  );
}
