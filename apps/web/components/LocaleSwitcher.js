"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCurrentLocale } from "@/locales/client";
import { LOCALES } from "@/locales/index.js";

const LABELS = { tr: "TR", en: "EN" };

function pathWithoutLocale(pathname, locale) {
  if (pathname === `/${locale}`) return "";
  if (pathname.startsWith(`/${locale}/`)) return pathname.slice(locale.length + 1);
  return pathname;
}

/**
 * Google'ın her iki dil sürümünü de bağımsız keşfedip taramasını sağlamak
 * için gerçek `<a href>` linkleri üretir — JS ile tetiklenen bir navigasyon
 * (ör. yalnızca cookie güncelleyip router.push çağıran bir buton) yerine,
 * Googlebot'un link keşfi doğrudan href'e dayandığı için crawl edilebilir
 * kalır. Sadece Accept-Language/cookie negotiation'a bırakmak, Googlebot'un
 * ikinci dili hiç bulamamasına yol açan tipik hatadır.
 */
export function LocaleSwitcher() {
  const pathname = usePathname();
  const currentLocale = useCurrentLocale();
  const restOfPath = pathWithoutLocale(pathname, currentLocale);

  return (
    <div className="flex items-center gap-1 text-sm" role="group" aria-label="Language">
      {LOCALES.map((locale) => (
        <Link
          key={locale}
          href={`/${locale}${restOfPath}`}
          hrefLang={locale}
          aria-current={locale === currentLocale ? "true" : undefined}
          className={
            locale === currentLocale
              ? "rounded-md px-2 py-1 font-semibold text-foreground"
              : "rounded-md px-2 py-1 text-muted-foreground hover:text-foreground"
          }
        >
          {LABELS[locale]}
        </Link>
      ))}
    </div>
  );
}
