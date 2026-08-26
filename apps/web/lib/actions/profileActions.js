"use server";

import { updateProfile } from "@hemdem/core/usecases/profile/updateProfile";
import { repositories } from "@/lib/repositories";
import { getAuthUserId } from "@/lib/session";

/**
 * @param {object} input
 */
export async function updateProfileAction(input) {
  const userId = await getAuthUserId();
  if (!userId) {
    return { status: "error", message: "not_authenticated" };
  }
  return updateProfile(repositories, userId, input);
}
