import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { listPresetCards } from "@/lib/presets";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.appUrl();
  const presets = await listPresetCards();
  const staticPages = ["", "/presets", "/ugc", "/pricing", "/legal/terms", "/legal/privacy", "/legal/acceptable-use", "/legal/refunds"];
  return [
    ...staticPages.map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.6 })),
    ...presets.map((p) => ({
      url: `${base}/presets/${p.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      videos: p.preview_video_url
        ? [{ title: `${p.name} AI video preset`, description: p.description, thumbnail_loc: `${base}${p.thumbnail_url}`, content_loc: `${base}${p.preview_video_url}` }]
        : undefined,
    })),
  ];
}
