"use client";

import { useEffect } from "react";
import { markMessageNotificationsReadAction } from "@/lib/actions/notificationActions";

/**
 * Mesajlar listesi görüntülendiği anda okunmamış mesaj bildirimlerini
 * okundu işaretler — "Mesajlar" sekmesindeki rozet için ayrı tutulan
 * sayaç (bkz. notifications/MarkNotificationsRead.js'in mesaj karşılığı).
 * Sayfa yenilemeye gerek yok: rozet zaten AppShell'de bağımsız sondajla
 * güncelleniyor.
 */
export function MarkMessagesRead() {
  useEffect(() => {
    markMessageNotificationsReadAction();
  }, []);

  return null;
}
