/**
 * Genel bildirim zili sadece eşleşme/beğeni/test benzerliği bildirimlerini
 * sayar — mesaj bildirimleri kendi (Mesajlar sekmesindeki) rozetiyle
 * ayrı sayılır (bkz. countUnreadMessageNotifications.js).
 *
 * @param {object} repositories
 * @param {string} userId
 */
export async function countUnreadNotifications(repositories, userId) {
  return repositories.notification.countUnread(userId, { excludeType: "message" });
}
