/**
 * @param {ReturnType<import("./mockStore.js").getMockStore>} store
 * @returns {import("../../domain/repositories/notificationRepository.js").NotificationRepository}
 */
export function createMockNotificationRepository(store) {
  return {
    async create(notification) {
      const full = {
        id: store.nextId.notification++,
        createdAt: new Date().toISOString(),
        actorId: null,
        testId: null,
        similarity: null,
        isRead: false,
        ...notification,
      };
      store.notifications.unshift(full);
      return full;
    },

    async findByUser(userId, limit = 50) {
      return store.notifications
        .filter((n) => n.userId === userId)
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
        .slice(0, limit);
    },

    async countUnread(userId) {
      return store.notifications.filter((n) => n.userId === userId && !n.isRead).length;
    },

    async markAllRead(userId) {
      for (const notification of store.notifications) {
        if (notification.userId === userId) notification.isRead = true;
      }
    },
  };
}
