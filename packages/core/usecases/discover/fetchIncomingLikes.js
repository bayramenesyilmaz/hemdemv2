/**
 * "Beğenenler" ekranı için: kullanıcıya gelen ama henüz kabul/reddet
 * (karşılık verilmemiş) beğenileri döndürür. Kabul edilen (karşılıklı
 * beğeniye dönüşen) veya reddedilen (dislike ile karşılık verilen)
 * beğeniler, kullanıcının kendi swipe kaydı oluştuğu için otomatik
 * olarak bu listeden düşer.
 *
 * @param {object} repositories
 * @param {string} userId
 */
export async function fetchIncomingLikes(repositories, userId) {
  const incoming = await repositories.swipe.findIncomingLikes(userId);

  const pending = [];
  for (const swipe of incoming) {
    const myResponse = await repositories.swipe.findByPair(userId, swipe.fromUser);
    if (!myResponse) pending.push(swipe);
  }

  return { status: "success", data: pending };
}
