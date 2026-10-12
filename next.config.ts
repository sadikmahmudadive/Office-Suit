import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Reuse a page visited in the last 30s when switching tabs instead of
    // refetching it. Server actions still refresh it right after a change.
    staleTimes: { dynamic: 30 },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
