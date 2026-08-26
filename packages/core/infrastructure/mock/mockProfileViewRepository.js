/**
 * @param {ReturnType<import("./mockStore.js").getMockStore>} store
 * @returns {import("../../domain/repositories/profileViewRepository.js").ProfileViewRepository}
 */
export function createMockProfileViewRepository(store) {
  return {
    async recordView(viewerId, viewedId) {
      const exists = store.profileViews.some(
        (v) => v.viewerId === viewerId && v.viewedId === viewedId
      );
      if (!exists) {
        store.profileViews.push({
          id: store.nextId.profileView++,
          createdAt: new Date().toISOString(),
          viewerId,
          viewedId,
        });
      }
    },

    async countViews(viewedId) {
      return store.profileViews.filter((v) => v.viewedId === viewedId).length;
    },

    async findViewers(viewedId) {
      return store.profileViews
        .filter((v) => v.viewedId === viewedId)
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    },
  };
}
