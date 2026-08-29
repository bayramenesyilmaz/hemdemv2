/**
 * Mesajlar sekmesindeki rozet için: sadece okunmamış mesaj bildirimlerini
 * sayar. Genel bildirim ziliyle (countUnreadNotifications.js) karışmasın
 * diye ayrı tutulur.
 *
 * @param {object} repositories
 * @param {string} userId
 */
export async function countUnreadMessageNotifications(repositories, userId) {
  return repositories.notification.countUnread(userId, { type: "message" });
}
