import { LOCALES } from "@/locales/index.js";

export default function sitemap() {
  const domain = process.env.NEXT_PUBLIC_DOMAIN ?? "https://example.com";

  return LOCALES.map((locale) => ({
    url: `${domain}/${locale}`,
    lastModified: new Date(),
    alternates: {
      languages: Object.fromEntries(LOCALES.map((l) => [l, `${domain}/${l}`])),
    },
  }));
}
