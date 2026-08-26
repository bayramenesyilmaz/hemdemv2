import { COIN_COSTS } from "../../domain/entities/coin.js";

/**
 * Profili kimlerin görüntülediğini coin karşılığı açar. Görüntülenme
 * sayısı zaten herkese açıktır (bkz. herkese açık profil sayfası);
 * burada açılan şey sadece görüntüleyenlerin kimliğidir.
 *
 * @param {object} repositories
 * @param {string} userId
 */
export async function unlockProfileViewers(repositories, userId) {
  const { ok, newBalance } = await repositories.coin.decrementIfSufficient(
    userId,
    COIN_COSTS.unlockProfileViewers
  );
  if (!ok) {
    return { status: "error", message: "insufficient_coins" };
  }

  const views = await repositories.profileView.findViewers(userId);
  const profiles = await Promise.all(views.map((view) => repositories.user.findById(view.viewerId)));
  const viewers = views
    .map((view, index) => ({ viewedAt: view.createdAt, viewer: profiles[index] }))
    .filter((entry) => entry.viewer);

  return { status: "success", data: { newBalance, viewers } };
}
