/**
 * Supabase Auth oturumu client tarafında zaten kuruldu; bu usecase
 * profili yükler ve ban kontrolü yapar.
 *
 * @param {object} repositories
 * @param {string} userId
 */
export async function loginUser(repositories, userId) {
  const profile = await repositories.user.findById(userId);

  if (!profile) {
    return { status: "error", message: "profile_not_found" };
  }
  if (profile.isBanned) {
    return { status: "error", message: "account_banned" };
  }

  return { status: "success", data: profile };
}
