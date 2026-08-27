"use server";

import { markNotificationsRead } from "@hemdem/core/usecases/notifications/markNotificationsRead";
import { repositories } from "@/lib/repositories";
import { getAuthUserId } from "@/lib/session";
import { safeCountUnreadNotifications } from "@/lib/notifications";

export async function markNotificationsReadAction() {
  const userId = await getAuthUserId();
  if (!userId) {
    return { status: "error", message: "not_authenticated" };
  }
  return markNotificationsRead(repositories, userId);
}

/**
 * Header'daki bildirim rozetinin kısa aralıklarla anlık taze kalması için
 * — Supabase Realtime bu projede kullanılamadığından (bkz. ChatThread.js'
 * teki aynı gerekçe) sondaj (polling) ile yeni bildirim sayısı çekilir.
 */
export async function fetchUnreadNotificationCountAction() {
  const userId = await getAuthUserId();
  if (!userId) return 0;
  return safeCountUnreadNotifications(userId);
}
