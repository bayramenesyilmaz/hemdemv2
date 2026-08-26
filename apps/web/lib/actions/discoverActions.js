"use server";

import { likeUser } from "@hemdem/core/usecases/discover/likeUser";
import { guestRegisterAndLike } from "@hemdem/core/usecases/discover/guestRegisterAndLike";
import { repositories } from "@/lib/repositories";
import { getAuthUserId } from "@/lib/session";

/**
 * @param {string} targetUserId
 * @param {"like" | "dislike"} action
 */
export async function swipeAction(targetUserId, action) {
  const userId = await getAuthUserId();
  if (!userId) {
    return { status: "error", message: "not_authenticated" };
  }
  return likeUser(repositories, userId, targetUserId, action);
}

/**
 * Beğenenler ekranında bir beğeniye karşılık verir (kabul = "like",
 * ret = "dislike"). Kabul, karşılıklı beğeni olduğu için her zaman
 * eşleşme oluşturur — hedefin kapı testi varsa aynı kontrol geçerlidir.
 *
 * @param {string} fromUserId
 * @param {"like" | "dislike"} action
 */
export async function respondToIncomingLikeAction(fromUserId, action) {
  const userId = await getAuthUserId();
  if (!userId) {
    return { status: "error", message: "not_authenticated" };
  }
  return likeUser(repositories, userId, fromUserId, action);
}

/**
 * Misafirin hızlı kayıt sonrası gönderdiği beğeni. `input.id`, client
 * tarafında zaten tamamlanmış olan signUp'tan (mock veya gerçek
 * Supabase Auth) gelir.
 *
 * @param {{ id: string, name: string, language: string }} input
 * @param {string} targetUserId
 */
export async function guestLikeAction(input, targetUserId) {
  return guestRegisterAndLike(repositories, input, targetUserId);
}
