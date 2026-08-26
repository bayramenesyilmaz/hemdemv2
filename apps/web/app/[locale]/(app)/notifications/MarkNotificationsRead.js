"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { markNotificationsReadAction } from "@/lib/actions/notificationActions";

/**
 * Bildirim listesi görüntülendiği anda hepsini okundu işaretler ve
 * kabuğu tazeler (header'daki okunmamış rozeti sunucuda hesaplanıyor).
 * Ayrı bir "okundu işaretle" butonu istemedik: listeyi açmak zaten
 * okuma eylemidir.
 */
export function MarkNotificationsRead() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    markNotificationsReadAction().then(() => {
      if (!cancelled) router.refresh();
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

  return null;
}
