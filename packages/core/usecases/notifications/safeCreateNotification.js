/**
 * Bildirim oluşturmak, tetikleyen ana işlemin (cevap kaydetme, beğeni
 * gönderme, mesaj gönderme) yanında ikincil bir yan etkidir — ana işlem
 * zaten veritabanına yazılmış olsa bile, sadece bildirim oluşturma
 * başarısız olduğu için (örn. `notifications` tablosu/migration eksikse,
 * ya da geçici bir ağ hatasında) kullanıcıya "hata" gösterip asıl
 * sonucu (test sonucu, eşleşme, mesaj) hiç göstermemek büyük bir
 * kullanıcı deneyimi sorunuydu: önceden `notification.create` hatası
 * `submitAnswers`/`likeUser`/`sendMessage`'ın tamamını patlatıyor,
 * istemci tarafında "gönderiliyor" durumunda sonsuza kadar takılı
 * kalıyordu. Bu sarmalayıcı hatayı yutar, sadece loglar.
 *
 * @param {object} repositories
 * @param {Partial<import("../../domain/entities/notification.js").Notification>} notification
 */
export async function safeCreateNotification(repositories, notification) {
  try {
    await repositories.notification.create(notification);
  } catch (error) {
    console.error("[notifications] bildirim oluşturulamadı, ana işlem yine de tamamlandı:", error);
  }
}
