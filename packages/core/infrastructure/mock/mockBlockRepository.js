/**
 * @param {ReturnType<import("./mockStore.js").getMockStore>} store
 * @returns {import("../../domain/repositories/blockRepository.js").BlockRepository}
 */
export function createMockBlockRepository(store) {
  return {
    async create(blockerId, blockedId) {
      const key = `${blockerId}:${blockedId}`;
      const full = {
        id: store.blocks.get(key)?.id ?? store.nextId.block++,
        createdAt: new Date().toISOString(),
        blockerId,
        blockedId,
      };
      store.blocks.set(key, full);
      return full;
    },

    async delete(blockerId, blockedId) {
      store.blocks.delete(`${blockerId}:${blockedId}`);
    },

    async exists(blockerId, blockedId) {
      return store.blocks.has(`${blockerId}:${blockedId}`);
    },

    async findBlockedIds(userId) {
      return [...store.blocks.values()].filter((b) => b.blockerId === userId).map((b) => b.blockedId);
    },

    async findRelatedIds(userId) {
      const ids = new Set();
      for (const block of store.blocks.values()) {
        if (block.blockerId === userId) ids.add(block.blockedId);
        if (block.blockedId === userId) ids.add(block.blockerId);
      }
      return [...ids];
    },
  };
}
