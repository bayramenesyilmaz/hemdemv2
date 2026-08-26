/**
 * @param {ReturnType<import("./mockStore.js").getMockStore>} store
 * @returns {import("../../domain/repositories/pointRepository.js").PointRepository}
 */
export function createMockPointRepository(store) {
  return {
    async getBalance(userId) {
      return store.points.get(userId) ?? 0;
    },

    async increment(userId, amount) {
      const newBalance = (store.points.get(userId) ?? 0) + amount;
      store.points.set(userId, newBalance);
      return newBalance;
    },
  };
}
