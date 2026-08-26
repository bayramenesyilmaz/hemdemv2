import { LOCALES, DEFAULT_LOCALE } from "@/locales/index.js";

export default function sitemap() {
  const domain = process.env.NEXT_PUBLIC_DOMAIN ?? "https://example.com";
  const languages = {
    ...Object.fromEntries(LOCALES.map((l) => [l, `${domain}/${l}`])),
    "x-default": `${domain}/${DEFAULT_LOCALE}`,
  };

  return LOCALES.map((locale) => ({
    url: `${domain}/${locale}`,
    lastModified: new Date(),
    alternates: { languages },
  }));
}
