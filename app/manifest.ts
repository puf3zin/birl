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
      // `any` sangra até a borda — é o que aparece na maioria dos lugares, e a
      // figura precisa ocupar o quadro inteiro aqui.
      { src: "/icone-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icone-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // `maskable` é o único que leva margem: o Android recorta até 20% da
      // borda, então a figura fica em 80% do quadro sobre o fundo da foto.
      {
        src: "/icone-512-mask.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
