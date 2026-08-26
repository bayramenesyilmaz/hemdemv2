/**
 * @param {ReturnType<import("./mockStore.js").getMockStore>} store
 * @returns {import("../../domain/repositories/postRepository.js").PostRepository}
 */
export function createMockPostRepository(store) {
  return {
    async create(post) {
      const full = {
        id: store.nextId.post++,
        createdAt: new Date().toISOString(),
        taggedTestId: null,
        ...post,
      };
      store.posts.unshift(full);
      return full;
    },

    async findFeed(limit = 20, before) {
      let posts = store.posts;
      if (before) posts = posts.filter((p) => p.createdAt < before);
      return posts.slice(0, limit);
    },

    async deleteOwn(id, userId) {
      const index = store.posts.findIndex((p) => p.id === id && p.userId === userId);
      if (index !== -1) store.posts.splice(index, 1);
    },
  };
}
