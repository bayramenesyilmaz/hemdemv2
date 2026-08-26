/**
 * @param {object} repositories
 * @param {string} userId
 */
export async function markNotificationsRead(repositories, userId) {
  await repositories.notification.markAllRead(userId);
  return { status: "success" };
}
