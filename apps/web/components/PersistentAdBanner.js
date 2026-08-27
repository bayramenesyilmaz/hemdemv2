"use client";

import { useI18n } from "@/locales/client";

/**
 * Alt navigasyonun (mobil) hemen üstünde, tüm `(app)` sayfalarında
 * sabit duran banner reklam alanı — sayfa içeriğiyle birlikte kaymaz,
 * bir ikinci "bottom bar" gibi her zaman görünür. Masaüstünde alt
 * navigasyon olmadığı için ekranın en altına, sidebar'ın genişliği
 * kadar içeri kayarak oturur (bkz. `AppShell`'in `lg:pl-64`'ü).
 */
export function PersistentAdBanner() {
  const t = useI18n();

  return (
    <div
      role="complementary"
      aria-label={t("ads.label")}
      className="fixed inset-x-0 bottom-[calc(var(--bottom-nav-h)+env(safe-area-inset-bottom))] z-30 flex items-center justify-center border-t border-dashed border-border bg-muted/80 text-xs font-medium uppercase tracking-widest text-muted-foreground backdrop-blur lg:bottom-0 lg:left-64"
      style={{ height: "var(--ad-banner-h)" }}
    >
      {t("ads.label")}
    </div>
  );
}
