import { registerUser } from "../auth/registerUser.js";
import { likeUser } from "./likeUser.js";

/**
 * Misafir modu: hesabı olmayan bir ziyaretçi, `allow_guest_likes=true`
 * olan bir profile beğeni göndermek istediğinde önce hızlı kayıt
 * (auth.users satırı client tarafında zaten oluşturulmuş olmalı), ardından
 * beğeni akışı çalışır.
 *
 * @param {object} repositories
 * @param {{ id: string, name?: string, language?: string }} guestInput
 * @param {string} targetUserId
 */
export async function guestRegisterAndLike(repositories, guestInput, targetUserId) {
  const targetProfile = await repositories.user.findById(targetUserId);
  if (!targetProfile) {
    return { status: "error", message: "target_not_found" };
  }
  if (!targetProfile.allowGuestLikes) {
    return { status: "error", message: "guest_likes_not_allowed" };
  }

  const registerResult = await registerUser(repositories, guestInput);
  if (registerResult.status === "error" && registerResult.message !== "profile_already_exists") {
    return registerResult;
  }

  return likeUser(repositories, guestInput.id, targetUserId, "like");
}
