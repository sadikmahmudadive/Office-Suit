import type { MetadataRoute } from "next";

// Lets teammates add Office Suit to their phone's home screen.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Office Suit",
    short_name: "Office Suit",
    description: "Team notes, work log and task tracking.",
    start_url: "/",
    display: "standalone",
    background_color: "#201e1d",
    theme_color: "#201e1d",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
