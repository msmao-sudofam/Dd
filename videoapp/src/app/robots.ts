import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  // A Vercel preview can be public (login wall off) while it still runs on mocks: keep it out of search engines.
  if (process.env.VERCEL_ENV === "preview") return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/dashboard", "/billing", "/library", "/generate", "/auth/"] },
    sitemap: `${env.appUrl()}/sitemap.xml`,
  };
}
