"use server";

import { markNotificationsRead } from "@hemdem/core/usecases/notifications/markNotificationsRead";
import { repositories } from "@/lib/repositories";
import { getAuthUserId } from "@/lib/session";

export async function markNotificationsReadAction() {
  const userId = await getAuthUserId();
  if (!userId) {
    return { status: "error", message: "not_authenticated" };
  }
  return markNotificationsRead(repositories, userId);
}
