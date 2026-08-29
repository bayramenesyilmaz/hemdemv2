/**
 * Bildirimler sayfası ziyaret edildiğinde çağrılır — mesaj bildirimleri
 * hariç, çünkü onlar kendi rozetiyle (Mesajlar sekmesi) ayrı yönetiliyor
 * ve ancak ilgili sohbet açıldığında okunmuş sayılmalı.
 *
 * @param {object} repositories
 * @param {string} userId
 */
export async function markNotificationsRead(repositories, userId) {
  await repositories.notification.markAllRead(userId, { excludeType: "message" });
  return { status: "success" };
}
