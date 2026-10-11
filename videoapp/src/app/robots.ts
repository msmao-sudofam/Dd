import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/dashboard", "/billing", "/library", "/generate", "/auth/"] },
    sitemap: `${env.appUrl()}/sitemap.xml`,
  };
}
