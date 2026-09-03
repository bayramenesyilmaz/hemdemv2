/**
 * Bugünün "Günün Eşleşmesi"ni profiliyle birlikte döner. Cron henüz
 * çalışmamışsa (ör. yeni kayıt olan bir kullanıcı için) ya da eşleşen
 * profil banlanmış/silinmişse `null` döner — Keşfet ekranı bu durumda
 * kartı hiç göstermez.
 *
 * @param {object} repositories
 * @param {string} userId
 */
export async function fetchDailyMatch(repositories, userId) {
  const dailyMatch = await repositories.dailyMatch.findByUser(userId);
  if (!dailyMatch?.matchedUserId) {
    return { status: "success", data: null };
  }

  const today = new Date().toISOString().slice(0, 10);
  if (dailyMatch.matchedDate !== today) {
    return { status: "success", data: null };
  }

  const profile = await repositories.user.findById(dailyMatch.matchedUserId);
  if (!profile || profile.isBanned) {
    return { status: "success", data: null };
  }

  return { status: "success", data: { profile, matchedDate: dailyMatch.matchedDate } };
}
