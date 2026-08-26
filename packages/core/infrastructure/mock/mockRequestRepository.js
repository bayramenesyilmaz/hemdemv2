/**
 * @param {ReturnType<import("./mockStore.js").getMockStore>} store
 * @returns {import("../../domain/repositories/requestRepository.js").RequestRepository}
 */
export function createMockRequestRepository(store) {
  return {
    async create(request) {
      const full = {
        id: `request-${store.nextId.request++}`,
        createdAt: new Date().toISOString(),
        userId: null,
        email: null,
        ...request,
      };
      store.requests.push(full);
      return full;
    },

    async findMany(filters = {}) {
      let requests = store.requests;
      if (filters.type) requests = requests.filter((r) => r.type === filters.type);
      return requests.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    },
  };
}
