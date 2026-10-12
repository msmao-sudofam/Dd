import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // ffmpeg-static ships a native binary; keep it out of the bundle (watermarking, Phase 5).
  serverExternalPackages: ["ffmpeg-static"],
  // Admin preset uploads go through a server action; Vercel caps request bodies at ~4.5 MB anyway.
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
  // Files read at runtime by path (not import), so the tracer must be told to ship them with the functions.
  outputFileTracingIncludes: {
    "/api/**": ["./node_modules/ffmpeg-static/ffmpeg", "./public/watermark.png", "./public/mock/**", "./assets/fonts/**"],
  },
  turbopack: {
    // The repo root has its own package-lock.json; pin the app root explicitly.
    root: path.resolve(__dirname),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
