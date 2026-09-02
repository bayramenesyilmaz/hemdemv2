import { orderUserPair } from "../../domain/entities/swipe.js";

/**
 * @param {ReturnType<import("./mockStore.js").getMockStore>} store
 * @returns {import("../../domain/repositories/chatRepository.js").ChatRepository}
 */
export function createMockChatRepository(store) {
  return {
    async findByPair(userIdA, userIdB) {
      const [userA, userB] = orderUserPair(userIdA, userIdB);
      return store.chats.get(`${userA}:${userB}`) ?? null;
    },

    async create(chat) {
      const [userA, userB] = orderUserPair(chat.userA, chat.userB);
      const key = `${userA}:${userB}`;
      const now = new Date().toISOString();
      const full = {
        id: store.nextId.chat++,
        createdAt: now,
        lastMessageAt: now,
        userA,
        userB,
        source: chat.source,
      };
      store.chats.set(key, full);
      return full;
    },

    async findByUser(userId) {
      return [...store.chats.values()]
        .filter((c) => c.userA === userId || c.userB === userId)
        .sort((a, b) => (a.lastMessageAt < b.lastMessageAt ? 1 : -1));
    },

    async findById(chatId) {
      return [...store.chats.values()].find((c) => c.id === chatId) ?? null;
    },

    async touchLastMessageAt(chatId, timestamp) {
      for (const chat of store.chats.values()) {
        if (chat.id === chatId) chat.lastMessageAt = timestamp;
      }
    },

    async createMessage(chatId, message) {
      const full = {
        id: store.nextId.message++,
        createdAt: new Date().toISOString(),
        chatId,
        ...message,
      };
      store.messages.push(full);
      return full;
    },

    async findMessages(chatId, limit = 50, before) {
      let messages = store.messages.filter((m) => m.chatId === chatId);
      if (before) messages = messages.filter((m) => m.createdAt < before);
      return messages.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, limit);
    },

    async deleteInactiveChats(cutoffIso) {
      let deleted = 0;
      for (const [key, chat] of store.chats) {
        if (chat.lastMessageAt < cutoffIso) {
          store.chats.delete(key);
          deleted += 1;
        }
      }
      return deleted;
    },

    async markRead(chatId, userId) {
      store.chatReads.set(`${chatId}:${userId}`, {
        chatId,
        userId,
        lastReadAt: new Date().toISOString(),
      });
    },

    async getReadStates(chatId) {
      return [...store.chatReads.values()]
        .filter((r) => r.chatId === chatId)
        .map(({ userId, lastReadAt }) => ({ userId, lastReadAt }));
    },
  };
}
