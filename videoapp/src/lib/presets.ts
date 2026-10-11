import "server-only";
import { db } from "@/lib/db";
import { creditCostFor } from "@/lib/pricing";
import type { Model, Preset, PresetCategory } from "@/lib/types";

export const CATEGORIES: { id: PresetCategory; label: string }[] = [
  { id: "product-ads", label: "Product Ads" },
  { id: "camera-moves", label: "Camera Moves" },
  { id: "ugc", label: "UGC" },
  { id: "effects", label: "Effects" },
  { id: "viral", label: "Viral Trends" },
];

export interface PresetCard {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: PresetCategory;
  thumbnail_url: string | null;
  preview_video_url: string | null;
  is_featured: boolean;
  requires_image: boolean;
  requires_subject: boolean;
  credits: number;
  modelName: string;
}

export function toCard(p: Preset, models: Map<string, Model>): PresetCard | null {
  const m = models.get(p.model_id);
  if (!m || !m.enabled) return null;
  const duration = (p.params_json as { duration?: number }).duration ?? m.default_duration;
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    category: p.category,
    thumbnail_url: p.thumbnail_url,
    preview_video_url: p.preview_video_url,
    is_featured: p.is_featured,
    requires_image: p.requires_image,
    requires_subject: p.requires_subject,
    credits: creditCostFor(m, duration),
    modelName: m.name,
  };
}

export async function listPresetCards(): Promise<PresetCard[]> {
  const [presets, models] = await Promise.all([db().listPresets(), db().listModels()]);
  const map = new Map(models.map((m) => [m.id, m]));
  return presets.map((p) => toCard(p, map)).filter((c): c is PresetCard => !!c);
}

export async function getPresetCard(slug: string): Promise<PresetCard | null> {
  const p = await db().getPreset(slug);
  if (!p || !p.enabled) return null;
  const m = await db().getModel(p.model_id);
  return m ? toCard(p, new Map([[m.id, m]])) : null;
}
