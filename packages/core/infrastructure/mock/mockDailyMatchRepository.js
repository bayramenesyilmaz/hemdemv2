/**
 * @param {ReturnType<import("./mockStore.js").getMockStore>} store
 * @returns {import("../../domain/repositories/dailyMatchRepository.js").DailyMatchRepository}
 */
export function createMockDailyMatchRepository(store) {
  return {
    async findByUser(userId) {
      return store.dailyMatches.get(userId) ?? null;
    },

    async upsert({ userId, matchedUserId, matchedDate }) {
      const full = {
        userId,
        matchedUserId,
        matchedDate,
        createdAt: new Date().toISOString(),
      };
      store.dailyMatches.set(userId, full);
      return full;
    },
  };
}
