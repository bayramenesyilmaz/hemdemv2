/**
 * Bildirimleri, tetikleyen kullanıcının profili ve (varsa) testin
 * başlığıyla zenginleştirilmiş şekilde döndürür — liste ekranında
 * "Zeynep, Hangi Diziyi İzlersin testinde seninle %92 uyumlu" gibi tek
 * satırda anlamlı bir metin kurabilmek için.
 *
 * Mesaj bildirimleri bu genel listede gösterilmez: onlar zaten sohbetin
 * kendisinde ve Mesajlar sekmesinin rozetinde görünür, burada tekrar
 * çıkması gürültü yaratır.
 *
 * @param {object} repositories
 * @param {string} userId
 */
export async function fetchNotifications(repositories, userId) {
  const notifications = (await repositories.notification.findByUser(userId)).filter(
    (n) => n.type !== "message"
  );

  const enriched = await Promise.all(
    notifications.map(async (notification) => {
      const needsChat = notification.type === "match";
      const [actor, test, chat] = await Promise.all([
        notification.actorId ? repositories.user.findById(notification.actorId) : null,
        notification.testId ? repositories.test.findById(notification.testId) : null,
        needsChat && notification.actorId
          ? repositories.chat.findByPair(userId, notification.actorId)
          : null,
      ]);
      return { notification, actor, test, chat };
    })
  );

  return { status: "success", data: enriched.filter((entry) => entry.actor) };
}
