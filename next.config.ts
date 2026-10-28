import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Onze AGENTS.md is handgeschreven; Next.js mag die niet overschrijven.
  agentRules: false,
  // Cache Components uit: de app leest de live klok/datum (routine-countdown,
  // weekoverzicht) tijdens render, wat niet samengaat met prerender-caching.
  cacheComponents: false,
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
