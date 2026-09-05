const MESSAGES = {
  content_required: "Mesaj boş olamaz.",
  content_too_long: "Mesaj çok uzun.",
  insufficient_coins: "Bu mesajı göndermek için yeterli coin'in yok.",
  cannot_message_self: "Kendine mesaj gönderemezsin.",
  recipient_not_found: "Bu kişi bulunamadı.",
  not_authorized: "Bu sohbete erişim yetkin yok.",
  user_blocked: "Bu kullanıcıyla mesajlaşamazsın.",
};

/**
 * `sendMessage` usecase'inin hata kodunu (web'deki `messages.errors.*`
 * çeviri anahtarlarıyla aynı sözlük) kullanıcıya gösterilecek Türkçe
 * metne çevirir — mobil next-international kullanmadığı için (bkz.
 * apps/mobile mimarisi) sabit bir eşleme burada tutuluyor, discover.js/
 * u/[id].js/messages/[chatId].js'de tekrarlanmasın diye.
 *
 * @param {string} message
 * @param {{ flaggedWords?: string[] }} [data]
 */
export function describeSendMessageError(message, data) {
  if (message === "inappropriate_content") {
    const words = (data?.flaggedWords ?? []).join(", ");
    return `Bu kelime(ler) yasaklı: (${words}). Mesajını düzenleyip tekrar dene.`;
  }
  return MESSAGES[message] ?? "Bir şeyler ters gitti, tekrar dene.";
}
