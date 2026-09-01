/**
 * Genel bildirim rozeti + mesaj rozeti için TEK DB isteğinde ikisini
 * birden döndürür. AppShell/BottomNav gibi her sayfada arka planda
 * sürekli poll edilen bir yer için — önceki iki ayrı
 * countUnreadNotifications/countUnreadMessageNotifications çağrısını
 * birleştirerek, girişi olan her kullanıcının sürekli poll yükünü
 * yarıya indirir (bkz. plan: global ölçekte en büyük tekil kazanç).
 *
 * @param {object} repositories
 * @param {string} userId
 */
export async function fetchUnreadSummary(repositories, userId) {
  const summary = await repositories.notification.countUnreadSummary(userId);
  return { status: "success", data: summary };
}
