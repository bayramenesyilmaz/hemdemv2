/**
 * @param {object} repositories
 * @param {string} userId
 */
export async function countUnreadNotifications(repositories, userId) {
  return repositories.notification.countUnread(userId);
}
