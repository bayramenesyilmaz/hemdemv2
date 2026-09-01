/**
 * Kullanıcının tüm sohbetlerini, karşı tarafın profili ve son mesaj
 * önizlemesiyle zenginleştirilmiş şekilde döndürür.
 *
 * @param {object} repositories
 * @param {string} userId
 */
export async function fetchChatList(repositories, userId) {
  const [chats, relatedBlockIds] = await Promise.all([
    repositories.chat.findByUser(userId),
    repositories.block.findRelatedIds(userId),
  ]);
  const blockedSet = new Set(relatedBlockIds);

  const enriched = await Promise.all(
    chats.map(async (chat) => {
      const otherUserId = chat.userA === userId ? chat.userB : chat.userA;
      if (blockedSet.has(otherUserId)) return null;
      const [otherUser, lastMessages] = await Promise.all([
        repositories.user.findById(otherUserId),
        repositories.chat.findMessages(chat.id, 1),
      ]);
      return { chat, otherUser, lastMessage: lastMessages[0] ?? null };
    })
  );

  return { status: "success", data: enriched.filter((entry) => entry && entry.otherUser) };
}
