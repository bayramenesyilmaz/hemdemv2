/**
 * @param {ReturnType<import("./mockStore.js").getMockStore>} store
 * @returns {import("../../domain/repositories/coinRepository.js").CoinRepository}
 */
export function createMockCoinRepository(store) {
  return {
    async getBalance(userId) {
      return store.coins.get(userId) ?? 0;
    },

    async increment(userId, amount) {
      const newBalance = (store.coins.get(userId) ?? 0) + amount;
      store.coins.set(userId, newBalance);
      return newBalance;
    },

    async decrementIfSufficient(userId, amount) {
      const balance = store.coins.get(userId) ?? 0;
      if (balance < amount) return { ok: false, newBalance: balance };
      const newBalance = balance - amount;
      store.coins.set(userId, newBalance);
      return { ok: true, newBalance };
    },
  };
}
