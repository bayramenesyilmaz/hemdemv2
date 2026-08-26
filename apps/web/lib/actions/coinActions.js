"use server";

import { grantAdWatchReward } from "@hemdem/core/usecases/coins/grantAdWatchReward";
import { repositories } from "@/lib/repositories";
import { getAuthUserId } from "@/lib/session";

/**
 * @param {number} tier
 */
export async function grantAdWatchRewardAction(tier) {
  const userId = await getAuthUserId();
  if (!userId) {
    return { status: "error", message: "not_authenticated" };
  }
  return grantAdWatchReward(repositories, userId, tier);
}
