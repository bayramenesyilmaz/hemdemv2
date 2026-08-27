import { DEFAULT_LOCALE } from "@/locales/index.js";

/**
 * PWA manifest'i (Next.js dosya tabanlı metadata kuralı). `start_url`
 * varsayılan dile işaret eder çünkü kök yol proxy tarafından zaten bir
 * dil önekine yönlendirilir — standalone modda gereksiz bir yönlendirme
 * adımını atlamış oluruz.
 */
export default function manifest() {
  return {
    name: "Hemdem — Kişiliğini keşfet, gerçek eşleşmeler bul",
    short_name: "Hemdem",
    description:
      "Kişilik testleri çöz, benzer düşünen insanlarla eşleş, gerçek bağlantılar kur.",
    start_url: `/${DEFAULT_LOCALE}/discover`,
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0e0e11",
    theme_color: "#0e0e11",
    categories: ["social", "lifestyle"],
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
