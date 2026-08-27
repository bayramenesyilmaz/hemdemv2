/**
 * @param {ReturnType<import("./mockStore.js").getMockStore>} store
 * @returns {import("../../domain/repositories/leaderboardRewardRepository.js").LeaderboardRewardRepository}
 */
export function createMockLeaderboardRewardRepository(store) {
  return {
    async hasGranted(periodType, periodKey) {
      return store.leaderboardRewardGrants.has(`${periodType}:${periodKey}`);
    },

    async recordGrant(periodType, periodKey) {
      store.leaderboardRewardGrants.add(`${periodType}:${periodKey}`);
    },
  };
}
