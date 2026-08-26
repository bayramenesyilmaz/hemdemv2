import { getAdWatchTier } from "../../domain/entities/coin.js";

/**
 * Reklam izleme kademesine karşılık gelen coin ödülünü kullanıcıya
 * ekler. Kademe bilgisi client'tan gelir ama geçerliliği burada
 * (sabit tier tablosu üzerinden) doğrulanır.
 *
 * @param {object} repositories
 * @param {string} userId
 * @param {number} tier
 */
export async function grantAdWatchReward(repositories, userId, tier) {
  const tierConfig = getAdWatchTier(tier);
  if (!tierConfig) {
    return { status: "error", message: "invalid_tier" };
  }

  const newBalance = await repositories.coin.increment(userId, tierConfig.coinReward);
  return { status: "success", data: { newBalance, reward: tierConfig.coinReward } };
}
