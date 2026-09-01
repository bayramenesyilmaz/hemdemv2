"use server";

import { markNotificationsRead } from "@hemdem/core/usecases/notifications/markNotificationsRead";
import { markMessageNotificationsRead } from "@hemdem/core/usecases/notifications/markMessageNotificationsRead";
import { repositories } from "@/lib/repositories";
import { getAuthUserId } from "@/lib/session";
import { safeFetchUnreadSummary } from "@/lib/notifications";

export async function markNotificationsReadAction() {
  const userId = await getAuthUserId();
  if (!userId) {
    return { status: "error", message: "not_authenticated" };
  }
  return markNotificationsRead(repositories, userId);
}

/**
 * AppShell'in sürekli poll döngüsü için — genel + mesaj sayacını TEK
 * HTTP isteği/DB sorgusunda döndürür (bkz. lib/notifications.js).
 */
export async function fetchUnreadSummaryAction() {
  const userId = await getAuthUserId();
  if (!userId) return { general: 0, message: 0 };
  return safeFetchUnreadSummary(userId);
}

export async function markMessageNotificationsReadAction() {
  const userId = await getAuthUserId();
  if (!userId) {
    return { status: "error", message: "not_authenticated" };
  }
  return markMessageNotificationsRead(repositories, userId);
}
