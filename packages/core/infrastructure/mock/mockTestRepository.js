/**
 * @param {ReturnType<import("./mockStore.js").getMockStore>} store
 * @returns {import("../../domain/repositories/testRepository.js").TestRepository}
 */
export function createMockTestRepository(store) {
  return {
    async findById(id) {
      const test = store.tests.get(id);
      return test && !test.isDeleted ? test : null;
    },

    async findMany(filters = {}) {
      let tests = [...store.tests.values()].filter((t) => !t.isDeleted && t.approved);
      if (filters.categoryId != null) tests = tests.filter((t) => t.categoryId === filters.categoryId);
      if (filters.language) tests = tests.filter((t) => t.language === filters.language);
      if (filters.search) {
        const needle = filters.search.toLowerCase();
        tests = tests.filter((t) => t.title.toLowerCase().includes(needle));
      }
      return tests.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    },

    async create(test) {
      const id = test.id ?? `test-${store.tests.size + 1}`;
      const full = {
        id,
        createdAt: new Date().toISOString(),
        point: 0,
        approved: true,
        isDeleted: false,
        ...test,
      };
      store.tests.set(id, full);
      return full;
    },

    async update(id, patch) {
      const existing = store.tests.get(id);
      if (!existing) throw new Error("mock_test_not_found");
      const updated = { ...existing, ...patch };
      store.tests.set(id, updated);
      return updated;
    },

    async softDelete(id) {
      const existing = store.tests.get(id);
      if (existing) store.tests.set(id, { ...existing, isDeleted: true });
    },

    async findCreatedByUser(userId) {
      return [...store.tests.values()]
        .filter((t) => t.createdBy === userId && !t.isDeleted)
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    },

    async findAnswer(userId, testId) {
      return store.answers.get(`${userId}:${testId}`) ?? null;
    },

    async saveAnswer(answer) {
      const key = `${answer.userId}:${answer.testId}`;
      const full = {
        id: store.answers.get(key)?.id ?? `answer-${store.answers.size + 1}`,
        createdAt: new Date().toISOString(),
        ...answer,
      };
      store.answers.set(key, full);
      return full;
    },

    async findAnswersByUser(userId) {
      return [...store.answers.values()]
        .filter((a) => a.userId === userId)
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    },

    async findLeaderboard(limit = 20) {
      return [...store.points.entries()]
        .map(([userId, point]) => ({ userId, point }))
        .sort((a, b) => b.point - a.point)
        .slice(0, limit);
    },
  };
}
