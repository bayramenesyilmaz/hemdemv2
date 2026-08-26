/**
 * Kullanıcının tüm sohbetlerini, karşı tarafın profili ve son mesaj
 * önizlemesiyle zenginleştirilmiş şekilde döndürür.
 *
 * @param {object} repositories
 * @param {string} userId
 */
export async function fetchChatList(repositories, userId) {
  const chats = await repositories.chat.findByUser(userId);

  const enriched = await Promise.all(
    chats.map(async (chat) => {
      const otherUserId = chat.userA === userId ? chat.userB : chat.userA;
      const [otherUser, lastMessages] = await Promise.all([
        repositories.user.findById(otherUserId),
        repositories.chat.findMessages(chat.id, 1),
      ]);
      return { chat, otherUser, lastMessage: lastMessages[0] ?? null };
    })
  );

  return { status: "success", data: enriched.filter((entry) => entry.otherUser) };
}
