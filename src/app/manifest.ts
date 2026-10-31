import type { MetadataRoute } from "next";

/**
 * Web-app-manifest zodat Aura installeerbaar is ("Zet op beginscherm" op iPhone/
 * Android) en schermvullend opent als een echte app. Start op de bedieningspagina.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Aura — Ochtendroutine",
    short_name: "Aura",
    description: "Persoonlijke ochtendroutine met dashboard, muziek en workout.",
    start_url: "/app",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0b0f17",
    theme_color: "#0b0f17",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
