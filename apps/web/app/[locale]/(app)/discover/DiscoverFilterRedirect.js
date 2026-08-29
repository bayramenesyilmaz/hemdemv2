"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DISCOVER_FILTERS_STORAGE_KEY } from "./DiscoverFilters";

/**
 * Kullanıcı daha önce filtre uygulamışsa (bkz. DiscoverFilters'ın
 * localStorage'a yazdığı sorgu dizesi), filtresiz bir sayfa yüklemesinde
 * (örn. sekmeyi kapatıp tekrar açınca) o filtreleri otomatik geri
 * getirir — her seferinde yeniden girmesin diye.
 */
export function DiscoverFilterRedirect({ locale, hasQuery }) {
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
    }
  }, [hasQuery, locale, router]);

  return null;
}
