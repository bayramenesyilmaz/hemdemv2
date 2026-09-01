/**
 * @param {ReturnType<import("./mockStore.js").getMockStore>} store
 * @returns {import("../../domain/repositories/swipeRepository.js").SwipeRepository}
 */
export function createMockSwipeRepository(store) {
  return {
    async findByPair(fromUser, toUser) {
      return store.swipes.get(`${fromUser}:${toUser}`) ?? null;
    },

    async create(swipe) {
      const key = `${swipe.fromUser}:${swipe.toUser}`;
      const full = {
        id: store.swipes.get(key)?.id ?? store.nextId.swipe++,
        createdAt: new Date().toISOString(),
        ...swipe,
      };
      store.swipes.set(key, full);
      return full;
    },

    async findIncomingLikes(toUser) {
      return [...store.swipes.values()]
        .filter((s) => s.toUser === toUser && ["like", "superlike"].includes(s.action))
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    },

    async findByFromUser(fromUser) {
      return [...store.swipes.values()].filter((s) => s.fromUser === fromUser);
    },

    async delete(fromUser, toUser) {
      store.swipes.delete(`${fromUser}:${toUser}`);
    },

    async findManyByFromAndToUsers(fromUser, toUsers) {
      const toUserSet = new Set(toUsers);
      return [...store.swipes.values()].filter((s) => s.fromUser === fromUser && toUserSet.has(s.toUser));
    },
  };
}
