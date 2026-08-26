/**
 * Hesabı kalıcı olarak siler. `auth.users` satırının silinmesi,
 * `profiles.id -> auth.users.id` FK'sındaki `on delete cascade` sayesinde
 * profili ve ona bağlı tüm verileri (answers, swipes, matches, chats,
 * posts, notes, ...) otomatik olarak temizler.
 *
 * @param {object} repositories
 * @param {string} userId
 */
export async function deleteAccount(repositories, userId) {
  if (!userId) {
    return { status: "error", message: "user_id_required" };
  }

  await repositories.authAdmin.deleteUser(userId);

  return { status: "success" };
}
