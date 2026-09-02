/**
 * Sohbet ekranı görünürken düzenli aralıklarla çağrılır (mevcut poll
 * tick'ine eklenir) — "Görüldü" bilgisi buradan türetilir: karşı tarafın
 * bu sohbetteki `last_read_at`'i benim gönderdiğim son mesajın
 * `created_at`'inden sonraysa o mesaj "görüldü" sayılır.
 *
 * @param {object} repositories
 * @param {string} userId
 * @param {number} chatId
 */
export async function markChatRead(repositories, userId, chatId) {
  const chat = await repositories.chat.findById(chatId);
  if (!chat) {
    return { status: "error", message: "chat_not_found" };
  }
  if (chat.userA !== userId && chat.userB !== userId) {
    return { status: "error", message: "not_authorized" };
  }

  await repositories.chat.markRead(chatId, userId);
  return { status: "success" };
}
