import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Onze AGENTS.md is handgeschreven; Next.js mag die niet overschrijven.
  agentRules: false,
  cacheComponents: true,
  partialPrefetching: true,
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
