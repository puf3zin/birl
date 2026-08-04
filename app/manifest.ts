import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "birl",
    short_name: "birl",
    description: "Contador de séries por grupo muscular na semana.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#171815",
    theme_color: "#171815",
    icons: [
      { src: "/icone-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icone-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/icone-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
