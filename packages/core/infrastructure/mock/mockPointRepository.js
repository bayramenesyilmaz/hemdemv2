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
      store.pointEvents.push({ userId, points: amount, createdAt: new Date().toISOString() });
      return newBalance;
    },

    async findWindowedLeaderboard(windowMs, limit = 20) {
      const cutoff = Date.now() - windowMs;
      const totals = new Map();
      for (const event of store.pointEvents) {
        if (new Date(event.createdAt).getTime() < cutoff) continue;
        totals.set(event.userId, (totals.get(event.userId) ?? 0) + event.points);
      }
      return [...totals.entries()]
        .map(([userId, point]) => ({ userId, point }))
        .sort((a, b) => b.point - a.point)
        .slice(0, limit);
    },
  };
}
