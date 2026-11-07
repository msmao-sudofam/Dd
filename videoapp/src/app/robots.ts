import type { MetadataRoute } from "next";
import { demoMode } from "@/components/demo-banner";
import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  // Previews, and any deployment still on simulated generation or payments, stay out of search engines.
  if (process.env.VERCEL_ENV === "preview" || demoMode()) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/dashboard", "/billing", "/library", "/generate", "/auth/"] },
    sitemap: `${env.appUrl()}/sitemap.xml`,
  };
}
