/**
 * @param {object} repositories
 * @param {string} callerId
 * @param {string} targetUserId
 * @param {boolean} isBanned
 */
export async function setUserBanStatus(repositories, callerId, targetUserId, isBanned) {
  const caller = await repositories.user.findById(callerId);
  if (!caller || caller.role !== "admin") {
    return { status: "error", message: "not_authorized" };
  }

  const target = await repositories.user.findById(targetUserId);
  if (!target) {
    return { status: "error", message: "user_not_found" };
  }
  if (target.role === "admin") {
    return { status: "error", message: "cannot_ban_admin" };
  }

  const updated = await repositories.user.update(targetUserId, { isBanned });
  return { status: "success", data: updated };
}
