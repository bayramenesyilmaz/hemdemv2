/**
 * @param {ReturnType<import("./mockStore.js").getMockStore>} store
 * @returns {import("../../domain/repositories/authAdminRepository.js").AuthAdminRepository}
 */
export function createMockAuthAdminRepository(store) {
  return {
    async deleteUser(userId) {
      store.profiles.delete(userId);
      for (const [email, user] of store.authUsers) {
        if (user.id === userId) store.authUsers.delete(email);
      }
    },
  };
}
