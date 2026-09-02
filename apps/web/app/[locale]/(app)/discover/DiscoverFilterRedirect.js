"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DISCOVER_FILTERS_STORAGE_KEY } from "./DiscoverFilters";

/**
 * Kullanıcı daha önce filtre uygulamışsa (bkz. DiscoverFilters'ın
 * localStorage'a yazdığı sorgu dizesi), filtresiz bir sayfa yüklemesinde
 * (örn. sekmeyi kapatıp tekrar açınca) o filtreleri otomatik geri
 * getirir — her seferinde yeniden girmesin diye.
 *
 * `localStorage`'da hiç kayıt yoksa (`saved === null`) kullanıcı hiç
 * filtre uygulamamış/temizlememiş demektir — ilk kez keşfete giriyor
 * kabul edilir ve varsa kendi ülkesi varsayılan filtre olarak enjekte
 * edilir ("yakınındaki kişileri gör"). Kullanıcı bilinçli olarak
 * filtreleri temizlediğinde `saved === ""` olur (boş dize de saklanır,
 * bkz. DiscoverFilters.js) — bu durumda hiçbir şey enjekte edilmez,
 * tercihine saygı gösterilir.
 */
export function DiscoverFilterRedirect({ locale, hasQuery, viewerCountry }) {
  const router = useRouter();

  useEffect(() => {
    if (hasQuery) return;
    let saved;
    try {
      saved = localStorage.getItem(DISCOVER_FILTERS_STORAGE_KEY);
    } catch {
      return;
    }
    if (saved) {
      router.replace(`/${locale}/discover?${saved}`);
      return;
    }
    if (saved === null && viewerCountry) {
      router.replace(`/${locale}/discover?country=${encodeURIComponent(viewerCountry)}`);
    }
  }, [hasQuery, locale, router, viewerCountry]);

  return null;
}
