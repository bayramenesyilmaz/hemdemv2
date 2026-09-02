import { COIN_COSTS, BOOST_DURATION_MINUTES } from "../../domain/entities/coin.js";

/**
 * Coin karşılığı sınırlı süre keşfette öne çıkma. `unlockProfileViewers.js`
 * ile aynı desen: önce `decrementIfSufficient` (atomik), başarılıysa asıl
 * işlem.
 *
 * @param {object} repositories
 * @param {string} userId
 */
export async function activateBoost(repositories, userId) {
  const { ok, newBalance } = await repositories.coin.decrementIfSufficient(
    userId,
    COIN_COSTS.boostProfile
  );
  if (!ok) {
    return { status: "error", message: "insufficient_coins" };
  }

  const boostedUntil = new Date(Date.now() + BOOST_DURATION_MINUTES * 60 * 1000).toISOString();
  await repositories.user.update(userId, { boostedUntil });

  return { status: "success", data: { newBalance, boostedUntil } };
}
