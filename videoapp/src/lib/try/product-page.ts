// Reads a product's name and main photo out of a store page (Shopify, WooCommerce, Etsy and most others publish
// them as schema.org Product data and Open Graph tags). Pure string work: no network, no HTML parser dependency.

export interface ProductInfo {
  name: string;
  imageUrl: string | null;
}

const ENTITIES: Record<string, string> = { amp: "&", quot: '"', apos: "'", lt: "<", gt: ">", nbsp: " " };

export function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m);
}

/** "Glow Serum – Vitamin C | Store Name" → "Glow Serum". Keeps the first segment of a separated title. */
export function cleanProductName(raw: string): string {
  let s = decodeEntities(raw).replace(/\s+/g, " ").trim();
  const parts = s.split(/\s+[|–—·•:]\s+|\s+-\s+/);
  if (parts.length > 1 && parts[0].length >= 3) s = parts[0];
  s = s.replace(/^(buy|shop)\s+/i, "").trim();
  if (s.length > 60) s = s.slice(0, 60).replace(/\s+\S*$/, "").trim();
  return s;
}

function metaContent(html: string, key: string): string | null {
  const k = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const a = new RegExp(`<meta[^>]+(?:property|name)=["']${k}["'][^>]*?content=["']([^"']+)["']`, "i").exec(html);
  if (a) return decodeEntities(a[1]);
  const b = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]*?(?:property|name)=["']${k}["']`, "i").exec(html);
  return b ? decodeEntities(b[1]) : null;
}

type Json = null | string | number | boolean | Json[] | { [k: string]: Json };

function firstImage(v: Json | undefined): string | null {
  if (!v) return null;
  if (typeof v === "string") return v;
  if (Array.isArray(v)) {
    for (const x of v) {
      const u = firstImage(x);
      if (u) return u;
    }
    return null;
  }
  if (typeof v === "object") return firstImage(v.url ?? v.contentUrl ?? null);
  return null;
}

function findProduct(node: Json, depth = 0): { name?: string; image?: string } | null {
  if (!node || typeof node !== "object" || depth > 6) return null;
  if (Array.isArray(node)) {
    for (const x of node) {
      const hit = findProduct(x, depth + 1);
      if (hit) return hit;
    }
    return null;
  }
  const t = node["@type"];
  const types = Array.isArray(t) ? t : [t];
  if (types.some((x) => typeof x === "string" && /^(Product|ProductGroup)$/i.test(x))) {
    return { name: typeof node.name === "string" ? node.name : undefined, image: firstImage(node.image) ?? undefined };
  }
  for (const key of ["@graph", "mainEntity", "mainEntityOfPage", "itemListElement", "hasVariant"]) {
    const hit = findProduct(node[key] ?? null, depth + 1);
    if (hit) return hit;
  }
  return null;
}

function absolute(src: string | null | undefined, base: string): string | null {
  if (!src) return null;
  try {
    const u = new URL(decodeEntities(src.trim()), base);
    return u.protocol === "http:" || u.protocol === "https:" ? u.toString() : null;
  } catch {
    return null;
  }
}

/** Best available product name and photo on the page; either may be missing. */
export function extractProduct(html: string, pageUrl: string): ProductInfo {
  let ld: { name?: string; image?: string } | null = null;
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  for (let m = re.exec(html); m && !ld; m = re.exec(html)) {
    try {
      ld = findProduct(JSON.parse(m[1].trim()) as Json);
    } catch {
      /* malformed block: skip it */
    }
  }
  const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] ?? "";
  const name = cleanProductName(ld?.name ?? metaContent(html, "og:title") ?? metaContent(html, "twitter:title") ?? title);
  const image =
    absolute(ld?.image, pageUrl) ??
    absolute(metaContent(html, "og:image:secure_url"), pageUrl) ??
    absolute(metaContent(html, "og:image"), pageUrl) ??
    absolute(metaContent(html, "twitter:image"), pageUrl);
  return { name, imageUrl: image };
}
