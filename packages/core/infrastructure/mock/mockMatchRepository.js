import { orderUserPair } from "../../domain/entities/swipe.js";

/**
 * @param {ReturnType<import("./mockStore.js").getMockStore>} store
 * @returns {import("../../domain/repositories/matchRepository.js").MatchRepository}
 */
export function createMockMatchRepository(store) {
  return {
    async findByPair(userIdA, userIdB) {
      const [userA, userB] = orderUserPair(userIdA, userIdB);
      return store.matches.get(`${userA}:${userB}`) ?? null;
    },

    async create(userIdA, userIdB) {
      const [userA, userB] = orderUserPair(userIdA, userIdB);
      const key = `${userA}:${userB}`;
      const full = store.matches.get(key) ?? {
        id: store.nextId.match++,
        createdAt: new Date().toISOString(),
        userA,
        userB,
      };
      store.matches.set(key, full);
      return full;
    },

    async findByUser(userId) {
      return [...store.matches.values()]
        .filter((m) => m.userA === userId || m.userB === userId)
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    },
  };
}
