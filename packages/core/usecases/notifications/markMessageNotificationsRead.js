/**
 * Mesajlar listesi ziyaret edildiğinde çağrılır — "Mesajlar" sekmesindeki
 * rozeti sıfırlar. Genel bildirimleri etkilemez.
 *
 * @param {object} repositories
 * @param {string} userId
 */
export async function markMessageNotificationsRead(repositories, userId) {
  await repositories.notification.markAllRead(userId, { type: "message" });
  return { status: "success" };
}
