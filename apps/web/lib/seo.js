import { LOCALES, DEFAULT_LOCALE } from "@/locales/index.js";

const SITE_NAME = "Hemdem";

/**
 * Tüm indexlenebilir sayfalarda tekrar eden metadata şablonunu üretir:
 * canonical, hreflang alternates (x-default dahil), Open Graph ve
 * Twitter card. Bu olmadan her sayfa bu bloğu elle kopyalıyordu ve
 * hreflang/OG sadece ana sayfada vardı.
 *
 * @param {{ locale: string, path: string, title: string, description?: string, noindex?: boolean }} input
 * @param {string} input.path - locale'siz yol, `/` ile başlar (ana sayfa için "")
 */
export function buildMetadata({ locale, path, title, description, noindex = false }) {
  const domain = process.env.NEXT_PUBLIC_DOMAIN ?? "https://example.com";
  const canonicalPath = `/${locale}${path}`;
  const fullTitle = `${title} | ${SITE_NAME}`;

  const metadata = {
    title: fullTitle,
    description,
    alternates: {
      canonical: canonicalPath,
      languages: {
        ...Object.fromEntries(LOCALES.map((l) => [l, `/${l}${path}`])),
        "x-default": `/${DEFAULT_LOCALE}${path}`,
      },
    },
    openGraph: {
      title: fullTitle,
      description,
      url: `${domain}${canonicalPath}`,
      siteName: SITE_NAME,
      locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
  };

  if (noindex) {
    metadata.robots = { index: false };
  }

  return metadata;
}
