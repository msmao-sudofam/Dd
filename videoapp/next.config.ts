import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // ffmpeg-static ships a native binary; keep it out of the bundle (watermarking, Phase 5).
  serverExternalPackages: ["ffmpeg-static"],
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
