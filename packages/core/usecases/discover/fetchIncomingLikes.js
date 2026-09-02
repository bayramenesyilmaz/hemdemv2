import { safeFindRelatedBlockIds } from "../safety/safeBlockQueries.js";

/**
 * "Beğenenler" ekranı için: kullanıcıya gelen ama henüz kabul/reddet
 * (karşılık verilmemiş) beğenileri döndürür. Kabul edilen (karşılıklı
 * beğeniye dönüşen) veya reddedilen (dislike ile karşılık verilen)
 * beğeniler, kullanıcının kendi swipe kaydı oluştuğu için otomatik
 * olarak bu listeden düşer. Engellenen/engelleyen kullanıcılar da
 * (karşılıklı görünmezlik) filtrelenir.
 *
 * @param {object} repositories
 * @param {string} userId
 */
export async function fetchIncomingLikes(repositories, userId) {
  const [incoming, relatedBlockIds] = await Promise.all([
    repositories.swipe.findIncomingLikes(userId),
    safeFindRelatedBlockIds(repositories, userId),
  ]);

  const blockedSet = new Set(relatedBlockIds);
  const visibleIncoming = incoming.filter((swipe) => !blockedSet.has(swipe.fromUser));
  if (visibleIncoming.length === 0) {
    return { status: "success", data: [] };
  }

  // Tek toplu sorgu — her beğeni için ayrı ayrı findByPair çağırmak yerine
  // (N+1) kullanıcının bu göndericilere daha önce verdiği tüm karşılıkları
  // tek seferde çeker.
  const myResponses = await repositories.swipe.findManyByFromAndToUsers(
    userId,
    visibleIncoming.map((swipe) => swipe.fromUser)
  );
  const respondedFromUsers = new Set(myResponses.map((swipe) => swipe.toUser));

  const pending = visibleIncoming.filter((swipe) => !respondedFromUsers.has(swipe.fromUser));

  return { status: "success", data: pending };
}
