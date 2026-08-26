/**
 * Bir sohbetin mesajlarını getirir. Yalnızca sohbetin iki tarafından biri
 * erişebilir. Depo katmanı en yeniden en eskiye döner; burada ekranda
 * üstten alta doğru göstermek için eskiden yeniye çevrilir.
 *
 * @param {object} repositories
 * @param {string} userId
 * @param {number} chatId
 * @param {{ limit?: number, before?: string }} [options]
 */
export async function fetchChatMessages(repositories, userId, chatId, options = {}) {
  const chat = await repositories.chat.findById(chatId);
  if (!chat) {
    return { status: "error", message: "chat_not_found" };
  }
  if (chat.userA !== userId && chat.userB !== userId) {
    return { status: "error", message: "not_authorized" };
  }

  const otherUserId = chat.userA === userId ? chat.userB : chat.userA;
  const [otherUser, messages] = await Promise.all([
    repositories.user.findById(otherUserId),
    repositories.chat.findMessages(chatId, options.limit ?? 50, options.before),
  ]);

  return { status: "success", data: { chat, otherUser, messages: messages.slice().reverse() } };
}
