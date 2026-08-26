/**
 * Bildirimleri, tetikleyen kullanıcının profili ve (varsa) testin
 * başlığıyla zenginleştirilmiş şekilde döndürür — liste ekranında
 * "Zeynep, Hangi Diziyi İzlersin testinde seninle %92 uyumlu" gibi tek
 * satırda anlamlı bir metin kurabilmek için.
 *
 * @param {object} repositories
 * @param {string} userId
 */
export async function fetchNotifications(repositories, userId) {
  const notifications = await repositories.notification.findByUser(userId);

  const enriched = await Promise.all(
    notifications.map(async (notification) => {
      const [actor, test] = await Promise.all([
        notification.actorId ? repositories.user.findById(notification.actorId) : null,
        notification.testId ? repositories.test.findById(notification.testId) : null,
      ]);
      return { notification, actor, test };
    })
  );

  return { status: "success", data: enriched.filter((entry) => entry.actor) };
}
